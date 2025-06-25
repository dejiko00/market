import fs from "node:fs/promises";
import type { EntityManager } from "typeorm";
import PriceHistoryController from "../../controllers/price-history";
import ProductTypeController from "../../controllers/product-type";
import ProductVarietyController from "../../controllers/product-variety";
import dataSource from "../../data-source";
import type PriceHistory from "../../interfaces/price-history";
import type ProductType from "../../interfaces/product-type";
import type ProductVariety from "../../interfaces/product-variety";
import extractAll from "../../utils/regex/extractAll";
import textFix from "../../utils/textFix";
import { URL_PARSED, URL_RESPONSE } from "./common";

interface EmmsaRowProduct {
  type: string;
  variety: string;
  min: number;
  max: number;
  avg: number;
}

const COL_PRODUCT_TYPE = 0;
const COL_PRODUCT_VAR = 1;
const COL_PRODUCT_MIN = 2;
const COL_PRODUCT_MAX = 3;
const COL_PRODUCT_AVG = 4;

export const parse = async (date: Date): Promise<boolean> => {
  const data = await fs
    .readFile(URL_RESPONSE)
    .then((data) => {
      console.log(`😀 Read ${URL_RESPONSE} success!`);
      return data;
    })
    .catch((e) => {
      console.log(`💀 Failed to read ${URL_RESPONSE}.`);
      throw Error(e);
    });

  const rawGroupedProducts = await parseRawProducts(data.toString());
  const groupedProducts = rawGroupedProducts.reduce<
    Record<EmmsaRowProduct["type"], EmmsaRowProduct[]>
  >((acc, val) => {
    const product = {
      type: textFix(val[COL_PRODUCT_TYPE]),
      variety: textFix(val[COL_PRODUCT_VAR]),
      min: parseFloat(val[COL_PRODUCT_MIN]),
      max: parseFloat(val[COL_PRODUCT_MAX]),
      avg: parseFloat(val[COL_PRODUCT_AVG]),
    };
    if (acc[product.type] === undefined) acc[product.type] = [];
    acc[product.type].push(product);
    return acc;
  }, {});

  return (await dataSource.initialize())
    .transaction((transactionalEntityManager) =>
      populateDatabase(date, groupedProducts, transactionalEntityManager)
    )
    .then(() => {
      console.log("😀😀😀😀 Transaction success.");
      return true;
    })
    .catch(() => {
      console.log("💀💀💀💀 Transaction failed.");
      return false;
    });
};

async function parseRawProducts(contents: string) {
  const getTbodyContents = extractAll(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/gi);
  const getTrContents = extractAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi);
  const getTdContents = extractAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi);

  const tdGrouped = getTbodyContents(contents)
    .flatMap(getTrContents)
    .map(getTdContents);

  await fs
    .writeFile(URL_PARSED, tdGrouped.map((v) => v.join(", ")).join("\n"))
    .then(() => {
      console.log(`😀 Logged: ${URL_PARSED}!`);
    })
    .catch((e) => {
      throw Error(e || `💀💀💀💀 Failed to log ${URL_PARSED}.`);
    });

  return tdGrouped;
}

async function populateDatabase(
  date: Date,
  groupedProducts: Record<string, EmmsaRowProduct[]>,
  transactionalEntityManager: EntityManager
) {
  const productTypesMap = await populateProductTypes(
    date,
    groupedProducts,
    transactionalEntityManager
  );

  const products = Object.values(groupedProducts).flat();

  const productVarietiesMap = await populateProductVarieties(
    date,
    products,
    productTypesMap,
    transactionalEntityManager
  );

  await populatePriceHistories(
    date,
    products,
    productVarietiesMap,
    transactionalEntityManager
  );
}

async function populatePriceHistories(
  date: Date,
  products: EmmsaRowProduct[],
  productVarietiesMap: Record<
    ProductVariety["name"],
    Required<ProductVariety["id"]>
  >,
  transactionalEntityManager: EntityManager
) {
  const priceHistories = products.flatMap<PriceHistory>((product) => {
    const idVariety = productVarietiesMap[product.variety];
    if (idVariety === undefined) return [];
    return {
      date_price: date,
      id_product_variety: idVariety,
      avg_price: product.avg,
      max_price: product.max,
      min_price: product.min,
    };
  });

  await new PriceHistoryController().addMany(
    priceHistories,
    transactionalEntityManager
  );
}

async function populateProductVarieties(
  date: Date,
  products: EmmsaRowProduct[],
  productTypesMap: Record<ProductType["name"], Required<ProductType["id"]>>,
  transactionalEntityManager: EntityManager
) {
  let productVarieties = products.flatMap<ProductVariety>((product) => {
    const idProductType = productTypesMap[product.type];
    if (idProductType === undefined) return [];
    return {
      id_product_type: idProductType,
      name: textFix(product.variety),
      date_added: date,
      date_modified: date,
    };
  });

  productVarieties = await new ProductVarietyController().addMany(
    productVarieties,
    transactionalEntityManager
  );

  return productVarieties.reduce<
    Record<ProductVariety["name"], Required<ProductVariety["id"]>>
  >((acc, prodVar) => {
    // biome-ignore lint/style/noNonNullAssertion: <addMany does a find() after adding, so we know that the elements MUST have id.>
    acc[prodVar.name] = prodVar.id!;
    return acc;
  }, {});
}

async function populateProductTypes(
  date: Date,
  groupedProducts: Record<EmmsaRowProduct["type"], EmmsaRowProduct[]>,
  transactionalEntityManager: EntityManager
) {
  let productTypes = Object.keys(groupedProducts).map<ProductType>((name) => ({
    name: name,
    date_added: date,
    date_modified: date,
  }));

  productTypes = await new ProductTypeController().addMany(
    productTypes,
    transactionalEntityManager
  );

  return productTypes.reduce<
    Record<ProductType["name"], Required<ProductType["id"]>>
  >((acc, prodType) => {
    // biome-ignore lint/style/noNonNullAssertion: <addMany does a find() after adding, so we know that the elements MUST have id.>
    acc[prodType.name] = prodType.id!;
    return acc;
  }, {});
}
