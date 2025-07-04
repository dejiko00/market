import { type ProductVariety } from "./product-variety.js";

export interface PriceHistory {
  id_product_variety: number;
  date_price: Date;
  min_price: number;
  max_price: number;
  avg_price: number;
  product_variety?: ProductVariety;
}
