import { EntitySchema } from "typeorm";
import { PriceHistory } from "./price-history.interface.js";

export const priceHistoryEntity = new EntitySchema<PriceHistory>({
  name: "priceHistory",
  tableName: "dbo.ProductPriceHistory",
  columns: {
    id_product_variety: {
      type: "int",
      nullable: false,
      select: false,
      primary: true,
    },
    date_price: {
      type: "datetime2",
      nullable: false,
      select: true,
      primary: true,
    },
    min_price: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
      select: true,
    },
    max_price: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
      select: true,
    },
    avg_price: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
      select: true,
    },
  },
  relations: {
    product_variety: {
      target: "productVariety",
      type: "many-to-one",
      nullable: true,
      joinColumn: {
        name: "id_product_variety",
        referencedColumnName: "id",
      },
    },
  },
});
