import { EntitySchema } from "typeorm";
import type ProductType from "../interfaces/product-type";

export const ProductTypeEntity = new EntitySchema<ProductType>({
  name: "productType",
  tableName: "dbo.ProductType",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    name: {
      type: "nvarchar",
      length: 100,
      unique: true,
      nullable: false,
    },
    date_added: {
      type: "datetime2",
      nullable: false,
    },
    date_modified: {
      type: "datetime2",
      nullable: false,
    },
  },
});
