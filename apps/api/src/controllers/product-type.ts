import type express from "express";
import type typeorm from "typeorm";
import { createLoggerModule } from "utils-log";
import { ProductType, productTypeEntity } from "models";

export default class ProductTypeController {
  static path = "/products";
  static logger = createLoggerModule(ProductTypeController.path);
  private repository: typeorm.Repository<ProductType>;

  constructor(connection: typeorm.DataSource) {
    this.repository = connection.getRepository(productTypeEntity);
  }

  public initRoutes(app: express.Application) {
    app.route(`${ProductTypeController.path}`).get(this.getAll);
    app.route(`${ProductTypeController.path}/:id`).get(this.findOne);
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
}
