import type express from "express";
import type { EntityManager, Repository } from "typeorm";
import dataSource from "../data-source";
import type ProductType from "../interfaces/product-type";
import { productTypeEntity } from "../models/product-type";

export default class ProductTypeController {
  public path = "/products";
  private repository: Repository<ProductType>;

  constructor() {
    this.repository = dataSource.getRepository(productTypeEntity);
  }

  public initRoutes(app: express.Application) {
    app.route(`${this.path}`).get(this.getAll);
    app.route(`${this.path}/:id`).get(this.findOne);
  }

  private getAll = async (
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const products = await this.repository.find({
        select: { id: true, name: true },
        relations: {
          product_varieties: true,
        },
      });
      res.status(200).json(products);
    } catch (e) {
      console.log(e);
      next(e);
    }
  };
  private findOne = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const id = parseInt(req.params.id);
      const products = await this.repository.findOne({
        select: { id: true, name: true },
        where: {
          id: id,
        },
        relations: {
          product_varieties: true,
        },
      });
      res.status(200).json(products);
    } catch (e) {
      console.log(e);
      next(e);
    }
  };

  public addMany = async (
    productTypes: ProductType[],
    transactionalEntityManager: EntityManager
  ) => {
    const productTypeIds = (
      await transactionalEntityManager.upsert(productTypeEntity, productTypes, {
        conflictPaths: { name: true },
        skipUpdateIfNoValuesChanged: true,
      })
    ).identifiers;

    return await transactionalEntityManager.find(productTypeEntity, {
      where: productTypeIds,
      select: {
        id: true,
        name: true,
      },
    });
  };
}
