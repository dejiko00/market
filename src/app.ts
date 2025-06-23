import type { EntityManager } from "typeorm";
import dataSource from "./data-source";

export default class App {
  entityManager: EntityManager | undefined;

  constructor() {
    this.initDatabase().catch(() => console.log("Error initializing app."));
  }

  async initDatabase() {
    return dataSource
      .initialize()
      .then(() => {
        console.log("Database initialized.");
      })
      .catch((e) => {
        console.log("Database failed to initialize.");
        console.log(e);
      });
  }
}
