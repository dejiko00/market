import { type ProductType } from "./product-type.interface.js";

export interface ProductVariety {
  id?: number;
  id_product_type: number;
  product_type?: ProductType;
  name: string;
  date_added: Date;
  date_modified: Date;
}
