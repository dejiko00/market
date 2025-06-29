import type express from "express";
import type typeorm from "typeorm";
import createLoggerModule from "../utils/logger/loggerModule.js";
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

  public static addMany = async (
    productTypes: ProductType[],
    transactionalEntityManager: typeorm.EntityManager
  ) => {
    const logger = ProductTypeController.logger.child({ function: "addMany" });
    const productTypeIds = (
      await transactionalEntityManager
        .upsert(productTypeEntity, productTypes, {
          conflictPaths: { name: true },
          skipUpdateIfNoValuesChanged: true,
        })
        .catch((e) => {
          logger.error(e, `upsert failed.`);
          throw Error(e);
        })
    ).identifiers;

    logger.info(`upsert success.`);
    logger.debug(
      {
        result: productTypeIds,
      },
      `upsert result.`
    );

    const productTypesRes = await transactionalEntityManager
      .find(productTypeEntity, {
        where: productTypeIds,
        select: {
          id: true,
          name: true,
        },
      })
      .catch((e) => {
        logger.error(e, `find failed.`);
        throw Error(e);
      });

    logger.info(`find success.`);
    logger.debug({ length: productTypesRes.length }, `find result.`);

    return productTypesRes;
  };
}
