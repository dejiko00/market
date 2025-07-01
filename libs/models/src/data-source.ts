import { DataSource } from "typeorm";
import {
  priceHistoryEntity,
  productTypeEntity,
  productVarietyEntity,
} from "./entities/index.js";
import Env from "./env.js";

export const dataSource = new DataSource({
  type: "mssql",
  host: "localhost",
  port: Number(Env.MSSQL_TCP_PORT),
  username: Env.MSSQL_SA_USER,
  password: Env.MSSQL_SA_PASSWORD,
  database: "Market",
  synchronize: false,
  options: {
    trustServerCertificate: true,
    encrypt: true,
  },
  logging: true,
  logger: "file",
  entities: [productTypeEntity, productVarietyEntity, priceHistoryEntity],
  migrations: [],
  subscribers: [],
});
