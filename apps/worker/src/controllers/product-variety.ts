import type typeorm from "typeorm";
import { createLoggerModule } from "utils-log";
import { ProductVariety, productVarietyEntity } from "models";

export default class ProductVarietyController {
  static path = `/products/:pid/varieties`;
  static logger = createLoggerModule(ProductVarietyController.path);

  public static addMany = async (
    productVarieties: ProductVariety[],
    transactionalEntityManager: typeorm.EntityManager
  ) => {
    const logger = ProductVarietyController.logger.child({
      function: "addMany",
    });
    const productVarietyIds = (
      await transactionalEntityManager
        .upsert(productVarietyEntity, productVarieties, {
          conflictPaths: { id_product_type: true, name: true },
          skipUpdateIfNoValuesChanged: true,
        })
        .catch((e) => {
          logger.error(e, `upsert failed.`);
          throw Error(e);
        })
    ).identifiers;

    logger.info(`upsert success.`);
    logger.debug(
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
        logger.error(e, `find failed.`);
        throw Error(e);
      });

    logger.info(`find success.`);
    logger.debug({ length: productVarietiesRes.length }, `find result.`);

    return productVarietiesRes;
  };
}
