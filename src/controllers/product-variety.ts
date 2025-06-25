import type express from "express";
import type { EntityManager, Repository } from "typeorm";
import dataSource from "../data-source";
import type ProductVariety from "../interfaces/product-variety";
import { productVarietyEntity } from "../models/product-variety";

export default class ProductVarietyController {
  path = `/products/:pid/varieties`;
  private repository: Repository<ProductVariety>;

  constructor() {
    this.repository = dataSource.getRepository(productVarietyEntity);
  }

  public initRoutes(app: express.Application) {
    app.route(`${this.path}`).get(this.getAll);
    app.route(`${this.path}/:vid`).get(this.getOne);
  }

  private getAll = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const productId = parseInt(req.params.pid);
      const products = await this.repository.find({
        select: {
          id: true,
          name: true,
        },
        relations: {
          product_type: true,
        },
        where: {
          id_product_type: productId,
        },
      });

      res.status(200).json(products);
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
      const varietyId = parseInt(req.params.vid);
      const products = await this.repository.findOne({
        select: {
          id: true,
          name: true,
        },
        relations: {
          product_type: true,
        },
        where: {
          id: varietyId,
        },
      });

      res.status(200).json(products);
    } catch (e) {
      console.log(e);
      next(e);
    }
  };

  public addMany = async (
    productVarieties: ProductVariety[],
    transactionalEntityManager: EntityManager
  ) => {
    const productVarietyIds = (
      await transactionalEntityManager.upsert(
        productVarietyEntity,
        productVarieties,
        {
          conflictPaths: { id_product_type: true, name: true },
          skipUpdateIfNoValuesChanged: true,
        }
      )
    ).identifiers;

    return await transactionalEntityManager.find(productVarietyEntity, {
      where: productVarietyIds,
    });
  };
}
