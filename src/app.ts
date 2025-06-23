import ProductTypeController from "./controllers/product-type";
import dataSource from "./data-source";

export default class App {
  constructor() {
    this.initDatabase();
  }

  async initDatabase() {
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

  async initControllers() {
    new ProductTypeController();
  }
}
