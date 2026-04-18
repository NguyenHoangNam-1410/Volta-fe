import type { Address } from "../profiles/profile.interface";

export interface CartItem {
  id: number;
  item_type?: "product" | "bundle";
  item_id?: number;
  product_id?: number;
  bundle_id?: number;
  quantity: number;
  image_url?: string;
  line_total: number;
  product_name?: string;
  product_slug?: string;
  product_price?: number;
  product_stock?: number;
  bundle_name?: string;
  bundle_price?: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  count: number;
}

export interface RequestAddToCartDto {
  item_type?: "product" | "bundle";
  product_id?: number;
  bundle_id?: number;
  quantity: number;
}

export interface CheckOutCartResponse extends Cart {
  address: Address[];
}

export interface DiscountApplyDto {
  discount_code: string;
  subtotal: number;
}

export interface DiscountApplyResponse {
  discount_amount: number;
  total: number;
}

export interface PlaceOrderDto {
  address_id: number;
  discount_code?: string;
  payment_method: "cod" | "credit_card";
  delivery_tier: "standard" | "express";
}
