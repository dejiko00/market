import type ProductType from "./product-type.interface.js";

export default interface ProductVariety {
  id?: number;
  id_product_type: number;
  product_type?: ProductType;
  name: string;
  date_added: Date;
  date_modified: Date;
}
