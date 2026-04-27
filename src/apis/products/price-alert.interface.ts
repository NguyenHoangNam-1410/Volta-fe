export type PriceAlertType = "increase" | "decrease" | "clearance" | "review";

export interface PriceAlertMetrics {
  sold_quantity: number;
  sell_through_rate: number;
  demand_velocity: number;
  stock_days_remaining: number;
  cancel_rate: number;
}

export interface PriceAlert {
  product_id: number;
  name: string;
  price: number;
  stock: number;
  alert_type: PriceAlertType;
  severity: number;
  metrics: PriceAlertMetrics;
  recommended_action: string;
  suggested_price: number | null;
}

export interface PriceAlertSummary {
  increase: number;
  decrease: number;
  clearance: number;
  review: number;
  total: number;
}

export interface PriceAlertsResponse {
  summary: PriceAlertSummary;
  alerts: PriceAlert[];
  effective_filter: {
    start_date: string;
    end_date: string;
    days: number;
  };
}

export interface PriceAlertsRequestParam {
  start_date?: string;
  end_date?: string;
  days?: number;
}
