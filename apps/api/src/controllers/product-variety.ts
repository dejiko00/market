import type express from "express";
import type typeorm from "typeorm";
import createLoggerModule from "../utils/logger/loggerModule.js";
import { ProductVariety, productVarietyEntity } from "models";

export default class ProductVarietyController {
  static path = `/products/:pid/varieties`;
  static logger = createLoggerModule(ProductVarietyController.path);
  private repository: typeorm.Repository<ProductVariety>;

  constructor(connection: typeorm.DataSource) {
    this.repository = connection.getRepository(productVarietyEntity);
  }

  public initRoutes(app: express.Application) {
    app.route(`${ProductVarietyController.path}`).get(this.getAll);
    app.route(`${ProductVarietyController.path}/:vid`).get(this.getOne);
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

  public static addMany = async (
    productVarieties: ProductVariety[],
    transactionalEntityManager: typeorm.EntityManager
  ) => {
    const logger = ProductVarietyController.logger.child({
      function: "addMany",
    });
    const productVarietyIds = (
      await transactionalEntityManager
        .upsert(productVarietyEntity, productVarieties, {
          conflictPaths: { id_product_type: true, name: true },
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
        result: productVarietyIds,
      },
      `upsert result.`
    );

    const productVarietiesRes = await transactionalEntityManager
      .find(productVarietyEntity, {
        where: productVarietyIds,
      })
      .catch((e) => {
        logger.error(e, `find failed.`);
        throw Error(e);
      });

    logger.info(`find success.`);
    logger.debug({ length: productVarietiesRes.length }, `find result.`);

    return productVarietiesRes;
  };
}
