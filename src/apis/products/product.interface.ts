import type { BaseRequestParam } from "../../common/interfaces/base-requestdto.interface";
import type { ProductBadge, ProductRelationType } from "./product.enum";

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  badge: ProductBadge;
  is_active: boolean | number;
  create_at?: string;
  image_url?: string;
}

export interface RequestCreateProductDto {
  name: string;
  slug: string;
  category_id: number;
  description: string;
  price: number;
  stock: number;
  badge: ProductBadge;
  is_active: boolean;
  image: Blob;
}

export type ProductRequestParam = BaseRequestParam;

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  is_primary: boolean;
}

export interface CreateProductRelationDTO {
  related_id: number;
  type?: ProductRelationType;
  discount_amount?: number;
  sort_order?: number;
}
