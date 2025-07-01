import { type PriceHistory, priceHistoryEntity } from "models";
import type typeorm from "typeorm";
import { createLoggerModule } from "utils-log";

const path = "/prices";
const logger = createLoggerModule(path);

export const PriceHistoryController = {
  addMany: async (
    prices: PriceHistory[],
    transactionalEntityManager: typeorm.EntityManager
  ) => {
    const loggerController = logger.child({ function: "addMany" });
    const priceIds = (
      await transactionalEntityManager
        .upsert(priceHistoryEntity, prices, {
          skipUpdateIfNoValuesChanged: true,
          conflictPaths: { date_price: true, id_product_variety: true },
        })
        .catch((e) => {
          loggerController.error(e, `upsert failed.`);
          throw Error(e);
        })
    ).identifiers;

    loggerController.info(`upsert success.`);
    loggerController.debug(
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

    loggerController.info(`find success.`);
    loggerController.debug({ length: pricesRes.length }, `find result.`);

    return pricesRes;
  },
};
