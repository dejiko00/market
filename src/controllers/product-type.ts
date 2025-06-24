import type express from "express";
import type { Repository } from "typeorm";
import dataSource from "../data-source";
import type ProductType from "../interfaces/product-type";
import { productTypeEntity } from "../models/product-type";
export default class ProductTypeController {
  public path = "/products";
  private repository: Repository<ProductType>;
  private app: express.Application;

  constructor(app: express.Application) {
    this.app = app;
    this.repository = dataSource.getRepository(productTypeEntity);
  }

  public initRoutes() {
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
