import type express from "express";
import type typeorm from "typeorm";
import type PriceHistory from "../interfaces/price-history";
import { priceHistoryEntity } from "../models/price-history";
import createLoggerModule from "../utils/logger/loggerModule";

export default class PriceHistoryController {
  static path = "/prices";
  static logger = createLoggerModule(PriceHistoryController.path);
  private repository: typeorm.Repository<PriceHistory>;

  constructor(connection: typeorm.DataSource) {
    this.repository = connection.getRepository(priceHistoryEntity);
  }

  initRoutes(app: express.Application) {
    app.route(`${PriceHistoryController.path}`).get(this.getAll);
    app.route(`${PriceHistoryController.path}/:pvid`).get(this.getOne);
  }

  private getAll = async (
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const prices = await this.repository.find();
      res.status(200).json(prices);
    } catch (e) {
      console.log(e);
      next(e);
    }
  };
  private getOne = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const productVarietyId = parseInt(req.params.pvid);
      const prices = await this.repository.find({
        where: {
          id_product_variety: productVarietyId,
        },
      });
      res.status(200).json(prices);
    } catch (e) {
      console.log(e);
      next(e);
    }
  };

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
