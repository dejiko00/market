import type express from "express";
import type typeorm from "typeorm";
import { PriceHistory, priceHistoryEntity } from "models";
import { createLoggerModule } from "utils-log";
import type { Logger } from "pino";

export default class PriceHistoryController {
  static path = "/prices";
  static logger: Logger<string, boolean> = createLoggerModule(
    PriceHistoryController.path
  );
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
}
