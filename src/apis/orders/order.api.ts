import type {
  CreateOrderResponse,
  CustomerOrder,
  CustomerOrderDetail,
  Order,
  OrderRequestParam,
  OrderStat,
  OrderStatsRequestParam,
  RequestCreateOrderDto,
  RequestUpdateOrderDto,
} from "./order.interface";
import type {
  PaginatedResponse,
  ApiResponse,
} from "../../common/interfaces/base-requestdto.interface";
import axiosInstance from "../../common/configs/axios.config";
import type { OrderStatus } from "./order.enum";

const ADMIN_BASE_URL = "/admin/orders";
const CUSTOMER_BASE_URL = "/orders";

// meta
export const getAllOrder = (
  params?: OrderRequestParam,
): Promise<ApiResponse<PaginatedResponse<Order>>> => {
  return axiosInstance.get(ADMIN_BASE_URL, { params });
};

export const createOrder = (
  body: RequestCreateOrderDto,
): Promise<ApiResponse<ApiResponse<CreateOrderResponse>>> => {
  return axiosInstance.post(ADMIN_BASE_URL, body);
};

export const getOrderById = (
  id: string,
): Promise<ApiResponse<ApiResponse<Order>>> => {
  return axiosInstance.get(`${ADMIN_BASE_URL}/${id}`);
};

export const updateOrder = (
  id: string,
  body: RequestUpdateOrderDto,
): Promise<ApiResponse<ApiResponse<Order>>> => {
  return axiosInstance.put(`${ADMIN_BASE_URL}/${id}`, body);
};

export const updateOrderStatus = (
  id: string,
  status: OrderStatus,
): Promise<ApiResponse<ApiResponse<Order>>> => {
  return axiosInstance.put(`${ADMIN_BASE_URL}/${id}/status`, { status });
};

export const deleteOrder = (
  id: string,
): Promise<ApiResponse<ApiResponse<void>>> => {
  return axiosInstance.delete(`${ADMIN_BASE_URL}/${id}`);
};

export const getOrderStats = (
  params?: OrderStatsRequestParam,
): Promise<ApiResponse<ApiResponse<OrderStat>>> => {
  return axiosInstance.get(`${ADMIN_BASE_URL}/stats`, { params });
};

export const getCustomerOrders = (
  params?: OrderRequestParam,
): Promise<ApiResponse<PaginatedResponse<CustomerOrder>>> => {
  return axiosInstance.get(CUSTOMER_BASE_URL, { params });
};

export const getCurrentCustomerOrder = (): Promise<
  ApiResponse<CustomerOrder>
> => {
  return axiosInstance.get(`${CUSTOMER_BASE_URL}/my`);
};

export const getCustomerOrderById = (
  id: string,
): Promise<ApiResponse<CustomerOrderDetail>> => {
  return axiosInstance.get(`${CUSTOMER_BASE_URL}/${id}`);
};
