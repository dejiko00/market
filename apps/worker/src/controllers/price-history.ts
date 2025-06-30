import type typeorm from "typeorm";
import { PriceHistory, priceHistoryEntity } from "models";
import { createLoggerModule } from "utils-log";

export default class PriceHistoryController {
  static path = "/prices";
  static logger = createLoggerModule(PriceHistoryController.path);

  public static addMany = async (
    prices: PriceHistory[],
    transactionalEntityManager: typeorm.EntityManager
  ) => {
    const logger = PriceHistoryController.logger.child({ function: "addMany" });

    const priceIds = (
      await transactionalEntityManager
        .upsert(priceHistoryEntity, prices, {
          skipUpdateIfNoValuesChanged: true,
          conflictPaths: { date_price: true, id_product_variety: true },
        })
        .catch((e) => {
          logger.error(e, `upsert failed.`);
          throw Error(e);
        })
    ).identifiers;

    logger.info(`upsert success.`);
    logger.debug(
      {
        length: priceIds.length,
      },
      `upsert result.`
    );

    const pricesRes = await transactionalEntityManager.find(
      priceHistoryEntity,
      {
        where: priceIds,
      }
    );

    logger.info(`find success.`);
    logger.debug({ length: pricesRes.length }, `find result.`);

    return pricesRes;
  };
}
