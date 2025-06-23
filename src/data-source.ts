import { DataSource } from "typeorm";
import { ProductTypeEntity } from "./models/product-type";

const { MSSQL_SA_USER, MSSQL_SA_PASSWORD, MSSQL_TCP_PORT } = process.env;

const dataSource = new DataSource({
  type: "mssql",
  host: "localhost",
  port: Number(MSSQL_TCP_PORT),
  username: MSSQL_SA_USER,
  password: MSSQL_SA_PASSWORD,
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
