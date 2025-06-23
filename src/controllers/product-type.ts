import type express from "express";
import type { Repository } from "typeorm";
import dataSource from "../data-source";
import type ProductType from "../interfaces/product-type";
import { ProductTypeEntity } from "../models/product-type";

export default class ProductTypeController {
  path = "/products";
  private repository: Repository<ProductType>;
  private app: express.Application;

  constructor(app: express.Application) {
    this.app = app;
    this.repository = dataSource.getRepository(ProductTypeEntity);
    this.initRoutes();
  }

  private initRoutes() {
    this.app.route(`${this.path}`).get(this.getAll);
    this.app.route(`${this.path}/:id`).get(this.findOne);
  }

  private getAll = async (
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const products = await this.repository.find({
        select: { id: true, name: true },
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
      const products = await this.repository.find({
        where: {
          id: id,
        },
        select: { id: true, name: true },
      });
      res.status(200).json(products);
    } catch (e) {
      console.log(e);
      next(e);
    }
  };

  //   private save = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  //     try {
  //         const {  } = req.body;

  //         const productType: ProductType = {
  //             name: "Product3",
  //             date_added: new Date(),
  //             date_modified: new Date(),
  //           };
  //           this.repository.save(productType);
  //     } catch (e) {
  //         console.log(e);
  //       next(e);
  //     }
  //   };
}
