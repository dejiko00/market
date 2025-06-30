import { EntitySchema } from "typeorm";
import { type ProductVariety } from "../interfaces/product-variety.js";

export const productVarietyEntity = new EntitySchema<ProductVariety>({
  name: "productVariety",
  tableName: "dbo.ProductVariety",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
      select: false,
    },
    id_product_type: {
      type: "int",
      nullable: false,
      select: false,
    },
    name: {
      type: "nvarchar",
      length: 100,
      nullable: false,
      unique: true,
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
    product_type: {
      target: "productType",
      type: "many-to-one",
      nullable: false,
      joinColumn: {
        name: "id_product_type",
        referencedColumnName: "id",
      },
    },
  },
});
