import type { Repository } from "typeorm";
import dataSource from "../data-source";
import type ProductType from "../interfaces/product-type";
import { ProductTypeEntity } from "../models/product-type";

export default class ProductTypeController {
  private repository: Repository<ProductType>;

  constructor() {
    this.repository = dataSource.getRepository(ProductTypeEntity);

    Promise.any([this.save()]).then(() => this.all());
  }

  private all = async () => {
    console.log(await this.repository.find());
    console.log("select all");
  };

  private save = async () => {
    const productType: ProductType = {
      name: "Product3",
      date_added: new Date(),
      date_modified: new Date(),
    };
    this.repository.save(productType);
  };
}
