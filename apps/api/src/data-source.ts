import { DataSource } from "typeorm";
import Env from "./env.js";
import {
  priceHistoryEntity,
  productTypeEntity,
  productVarietyEntity,
} from "models";

const dataSource = new DataSource({
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

export default dataSource;
