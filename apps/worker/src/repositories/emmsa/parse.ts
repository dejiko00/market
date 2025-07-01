import fs from "node:fs/promises";
import {
  dataSource,
  type PriceHistory,
  type ProductType,
  type ProductVariety,
} from "models";
import type { Logger, pino } from "pino";
import type { EntityManager } from "typeorm";
import { PriceHistoryController } from "../../controllers/price-history.js";
import { ProductTypeController } from "../../controllers/product-type.js";
import { ProductVarietyController } from "../../controllers/product-variety.js";
import extractAll from "../../utils/regex/extractAll.js";
import textFix from "../../utils/textFix.js";
import { connectionDatabase } from "../data-source.js";

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

interface ParseOptions {
  date: Date;
  logger: Logger;
  pathLogResponse: string;
  pathLogParse: string;
}

export const parse = async ({
  date,
  logger,
  pathLogParse,
  pathLogResponse,
}: ParseOptions) => {
  const data = await fs.readFile(pathLogResponse).catch((e) => {
    logger.error(`readFile failed.`, { path: pathLogResponse, error: e });
    throw Error(e);
  });
  logger.info(
    { path: pathLogResponse, length: data.length },
    `readFile success.`
  );

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

  await connectionDatabase
    .transaction((transactionalEntityManager) =>
      populateDatabase(
        date,
        groupedProducts,
        transactionalEntityManager,
        logger,
        pathLogParse
      )
    )
    .catch((e) => {
      logger.error("Transaction failed. Executing rollback...", { error: e });
      throw Error(e);
    });

  logger.info(`Transaction success.`);
};

async function parseRawProducts(contents: string) {
  const getTbodyContents = extractAll(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/gi);
  const getTrContents = extractAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi);
  const getTdContents = extractAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi);

  return getTbodyContents(contents).flatMap(getTrContents).map(getTdContents);
}

async function populateDatabase(
  date: Date,
  groupedProducts: Record<string, EmmsaRowProduct[]>,
  transactionalEntityManager: EntityManager,
  logger: pino.Logger,
  pathLogParse: string
) {
  const productTypesMap = await populateProductTypes(
    date,
    groupedProducts,
    transactionalEntityManager
  );
  const products = Object.values(groupedProducts).flat();

  await fs
    .writeFile(
      pathLogParse,
      products.map((v) => Object.values(v).join(", ")).join("\n")
    )
    .catch((e) => {
      logger.error(`writeFile error`, { path: pathLogParse, error: e });
      throw Error(e);
    });
  logger.info(`writeFile success`, { path: pathLogParse });

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

  await PriceHistoryController.addMany(
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

  productVarieties = await ProductVarietyController.addMany(
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

  productTypes = await ProductTypeController.addMany(
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
