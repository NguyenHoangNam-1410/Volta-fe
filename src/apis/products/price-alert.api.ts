import axiosInstance from "../../common/configs/axios.config";
import type { ApiResponse } from "../../common/interfaces/base-requestdto.interface";
import type {
  PriceAlertsRequestParam,
  PriceAlertsResponse,
} from "./price-alert.interface";

const ADMIN_BASE_URL = "/admin/price-alerts";

export const getPriceAlerts = (
  params?: PriceAlertsRequestParam,
): Promise<ApiResponse<ApiResponse<PriceAlertsResponse>>> => {
  return axiosInstance.get(ADMIN_BASE_URL, { params });
};
