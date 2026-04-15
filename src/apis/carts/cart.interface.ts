import type { Address } from "../profiles/profile.interface";

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product_name: string;
  product_slug: string;
  product_price: number;
  product_stock: number;
  image_url: string;
  line_total: number;
}

export interface Cart {
    items: CartItem[];
    subtotal: number;
    count: number;
}

export interface RequestAddToCartDto {
    product_id: number;
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
    payment_method: 'cod' | 'credit_card';
    delivery_tier: 'standard' | 'express';
}