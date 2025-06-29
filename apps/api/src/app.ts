import express from "express";
import logger from "pino-http";
import type typeorm from "typeorm";
import PriceHistoryController from "./controllers/price-history";
import ProductTypeController from "./controllers/product-type";
import ProductVarietyController from "./controllers/product-variety";
import dataSource from "./data-source";
import Env from "./env";

export default class App {
  app: express.Application;

  constructor() {
    this.app = express();
    this.init();
  }

  private async init() {
    const connection = await this.initDatabase();
    this.initMiddleware();
    this.initControllers(connection);
  }

  private initMiddleware() {
    this.app.use(logger());
  }

  private async initDatabase() {
    const connection = await dataSource.initialize().catch((e) => {
      console.log("Database failed to initialize.");
      console.log(e);
      throw Error(e);
    });
    console.log("Database initialized.");
    return connection;
  }

  private initControllers(connection: typeorm.DataSource) {
    new ProductTypeController(connection).initRoutes(this.app);
    new ProductVarietyController(connection).initRoutes(this.app);
    new PriceHistoryController(connection).initRoutes(this.app);
  }

  listen() {
    this.app.listen(Env.NODE_PORT, () => {
      console.log(
        `App listening on ${Env.NODE_PORT} in ${this.app.get("env")} mode.`
      );
    });
  }
}
