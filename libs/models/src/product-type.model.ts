import { EntitySchema } from "typeorm";
import { type ProductType } from "./product-type.interface.js";

export const productTypeEntity = new EntitySchema<ProductType>({
  name: "productType",
  tableName: "dbo.ProductType",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
      select: false,
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
      select: false,
    },
    date_modified: {
      type: "datetime2",
      nullable: false,
      select: false,
    },
  },
  relations: {
    product_varieties: {
      target: "productVariety",
      type: "one-to-many",
      inverseSide: "product_type",
      nullable: true,
    },
  },
});
