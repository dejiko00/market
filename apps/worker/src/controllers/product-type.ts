import type typeorm from "typeorm";
import { createLoggerModule } from "utils-log";
import { ProductType, productTypeEntity } from "models";

export default class ProductTypeController {
  static path = "/products";
  static logger = createLoggerModule(ProductTypeController.path);

  public static addMany = async (
    productTypes: ProductType[],
    transactionalEntityManager: typeorm.EntityManager
  ) => {
    const logger = ProductTypeController.logger.child({ function: "addMany" });
    const productTypeIds = (
      await transactionalEntityManager
        .upsert(productTypeEntity, productTypes, {
          conflictPaths: { name: true },
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
        logger.error(e, `find failed.`);
        throw Error(e);
      });

    logger.info(`find success.`);
    logger.debug({ length: productTypesRes.length }, `find result.`);

    return productTypesRes;
  };
}
