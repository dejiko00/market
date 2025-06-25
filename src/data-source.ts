import { DataSource } from "typeorm";
import Env from "./env";
import { priceHistoryEntity } from "./models/price-history";
import { productTypeEntity } from "./models/product-type";
import { productVarietyEntity } from "./models/product-variety";

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
  entities: [productTypeEntity, productVarietyEntity, priceHistoryEntity],
  migrations: [],
  subscribers: [],
});

export default dataSource;
