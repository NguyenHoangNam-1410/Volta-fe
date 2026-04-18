import type { BaseRequestParam } from "../../common/interfaces/base-requestdto.interface";
import type { OrderStatus } from "./order.enum";

export interface Order {
  id?: number;
  user_id?: number;
  address_id?: number;
  status: OrderStatus;
  total_price: number;
  create_at?: string;
  items?: OrderItem[];
}

export interface RequestCreateOrderDto {
  user_id: number;
  address_id: number;
  status: OrderStatus;
  total_price: number;
}

export interface RequestUpdateOrderDto {
  status?: OrderStatus;
  address_id?: number;
  total_price?: number;
}

export interface OrderRequestParam extends BaseRequestParam {
  status?: OrderStatus;
}

export interface OrderStatsRequestParam {
  start_date?: string;
  end_date?: string;
  days?: number;
  recent_limit?: number;
  top_limit?: number;
}

export interface CreateOrderResponse {
  user_id: number;
  address_id: number;
  status: OrderStatus;
  total_price: number;
  items: CreateOrderItemDto[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface CreateOrderItemDto {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface OrderStat {
  total_orders: number;
  total_revenue: number;
  completed_orders: number;
  cancelled_orders: number;
  effective_filter?: EffectiveFilter;
  revenue_window_days?: number;
  revenue_by_day?: RevenueByDayPoint[];
  revenue_last_7_days?: RevenueByDayPoint[];
  recent_orders?: RecentOrderStat[];
  top_products?: TopProductStat[];
}

export interface EffectiveFilter {
  mode: 'last_n_days' | 'custom_range';
  start_date: string;
  end_date: string;
  days?: number;
}

export interface RevenueByDayPoint {
  date: string;
  day_of_week: string;
  amount: number;
}

export interface RecentOrderStat {
  order_id: number;
  customer: string;
  total: number;
  status: OrderStatus;
  date: string;
}

export interface TopProductStat {
  product_id: number;
  product: string;
  price: number;
  stock: number;
  sold_quantity: number;
}

export interface CustomerOrder extends Omit<Order, 'items'> {
  address_id: number;
}

export interface CustomerOrderDetail extends CustomerOrder {
  items: OrderItem[];
}