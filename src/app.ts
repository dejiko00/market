import express from "express";
import ProductTypeController from "./controllers/product-type";
import ProductVarietyController from "./controllers/product-variety";
import dataSource from "./data-source";
import Env from "./env";

export default class App {
  app: express.Application;

  constructor() {
    this.app = express();
    this.initDatabase();
    this.initControllers();
  }

  private async initDatabase() {
    dataSource
      .initialize()
      .then(() => {
        console.log("Database initialized.");
        this.initControllers();
      })
      .catch((e) => {
        console.log("Database failed to initialize.");
        console.log(e);
      });
  }

  private async initControllers() {
    new ProductTypeController(this.app).initRoutes();
    new ProductVarietyController(this.app).initRoutes();
  }

  listen() {
    this.app.listen(Env.NODE_PORT, () => {
      console.log(
        `App listening on ${Env.NODE_PORT} in ${this.app.get("env")} mode.`
      );
    });
  }
}
