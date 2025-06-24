import type ProductVariety from "./product-variety";

export default interface ProductType {
  id?: number;
  name: string;
  product_varieties?: ProductVariety[];
  date_added: Date;
  date_modified: Date;
}
