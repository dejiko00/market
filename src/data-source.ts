import { DataSource } from "typeorm";
import Env from "./env";
import { ProductTypeEntity } from "./models/product-type";

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
  entities: [ProductTypeEntity],
  migrations: [],
  subscribers: [],
});

export default dataSource;
