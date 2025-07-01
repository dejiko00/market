import { type ProductType, productTypeEntity } from "models";
import type typeorm from "typeorm";
import { createLoggerModule } from "utils-log";

const path = "/products";
const logger = createLoggerModule(path);

export const ProductTypeController = {
  addMany: async (
    productTypes: ProductType[],
    transactionalEntityManager: typeorm.EntityManager
  ) => {
    const loggerController = logger.child({ function: "addMany" });
    const productTypeIds = (
      await transactionalEntityManager
        .upsert(productTypeEntity, productTypes, {
          conflictPaths: { name: true },
          skipUpdateIfNoValuesChanged: true,
        })
        .catch((e) => {
          loggerController.error(e, `upsert failed.`);
          throw Error(e);
        })
    ).identifiers;

    loggerController.info(`upsert success.`);
    loggerController.debug(
      {
        result: productTypeIds,
      },
      `upsert result.`
    );

    const productTypesRes = await transactionalEntityManager
      .find(productTypeEntity, {
        where: productTypeIds,
        select: {
          id: true,
          name: true,
        },
      })
      .catch((e) => {
        loggerController.error(e, `find failed.`);
        throw Error(e);
      });

    loggerController.info(`find success.`);
    loggerController.debug({ length: productTypesRes.length }, `find result.`);

    return productTypesRes;
  },
};
