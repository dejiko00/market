import type express from "express";
import type { EntityManager, Repository } from "typeorm";
import dataSource from "../data-source";
import type PriceHistory from "../interfaces/price-history";
import { priceHistoryEntity } from "../models/price-history";

export default class PriceHistoryController {
  path = "/prices";
  private repository: Repository<PriceHistory>;

  constructor() {
    this.repository = dataSource.getRepository(priceHistoryEntity);
  }

  initRoutes(app: express.Application) {
    app.route(`${this.path}`).get(this.getAll);
    app.route(`${this.path}/:pvid`).get(this.getOne);
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

  public addMany = async (
    prices: PriceHistory[],
    transactionalEntityManager: EntityManager
  ) => {
    const priceIds = (
      await transactionalEntityManager.upsert(priceHistoryEntity, prices, {
        skipUpdateIfNoValuesChanged: true,
        conflictPaths: { date_price: true, id_product_variety: true },
      })
    ).identifiers;

    console.log("📝📝📝 priceIds: ", prices);

    return await transactionalEntityManager.find(priceHistoryEntity, {
      where: priceIds,
    });
  };
}
