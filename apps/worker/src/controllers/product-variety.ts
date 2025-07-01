import { type ProductVariety, productVarietyEntity } from "models";
import type typeorm from "typeorm";
import { createLoggerModule } from "utils-log";

const path = `/products/:pid/varieties`;
const logger = createLoggerModule(path);

export const ProductVarietyController = {
  addMany: async (
    productVarieties: ProductVariety[],
    transactionalEntityManager: typeorm.EntityManager
  ) => {
    const loggerController = logger.child({
      function: "addMany",
    });
    const productVarietyIds = (
      await transactionalEntityManager
        .upsert(productVarietyEntity, productVarieties, {
          conflictPaths: { id_product_type: true, name: true },
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
        result: productVarietyIds,
      },
      `upsert result.`
    );

    const productVarietiesRes = await transactionalEntityManager
      .find(productVarietyEntity, {
        where: productVarietyIds,
      })
      .catch((e) => {
        loggerController.error(e, `find failed.`);
        throw Error(e);
      });

    loggerController.info(`find success.`);
    loggerController.debug(
      { length: productVarietiesRes.length },
      `find result.`
    );

    return productVarietiesRes;
  },
};
