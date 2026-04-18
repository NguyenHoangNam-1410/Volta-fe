import axiosInstance from "../../common/configs/axios.config";
import type {
  ApiResponse,
  PaginatedResponse,
} from "../../common/interfaces/base-requestdto.interface";
import type {
  Bundle,
  BundleItem,
  BundleRequestParam,
  RequestCreateBundleDto,
} from "./bundle.interface";

const BASE_URL = "/bundles";

export const getAllBundles = (
  param: BundleRequestParam,
): Promise<ApiResponse<PaginatedResponse<Bundle>>> => {
  return axiosInstance.get(BASE_URL, {
    params: {
      search: param.search || "",
      page: param.page || 1,
      limit: param.limit || 10,
    },
  });
};

export const getActiveBundles = (): Promise<ApiResponse<Bundle[]>> => {
  return axiosInstance.get(`${BASE_URL}/active`);
};

export const getBundleById = (id: number): Promise<ApiResponse<Bundle>> => {
  return axiosInstance.get(`${BASE_URL}/${id}`);
};

export const createBundle = (
  body: RequestCreateBundleDto,
): Promise<ApiResponse<Bundle>> => {
  return axiosInstance.post(BASE_URL, body);
};

export const updateBundle = (
  id: number,
  body: RequestCreateBundleDto,
): Promise<ApiResponse<Bundle>> => {
  return axiosInstance.put(`${BASE_URL}/${id}`, body);
};

export const deleteBundle = (id: number): Promise<ApiResponse<void>> => {
  return axiosInstance.delete(`${BASE_URL}/${id}`);
};

export const getBundleItems = (
  id: number,
): Promise<ApiResponse<BundleItem[]>> => {
  return axiosInstance.get(`${BASE_URL}/${id}/items`);
};

export const addBundleItem = (
  id: number,
  body: { product_id: number; quantity: number },
): Promise<ApiResponse<void>> => {
  return axiosInstance.post(`${BASE_URL}/${id}/items`, body);
};

export const removeBundleItem = (
  id: number,
  itemId: number,
): Promise<ApiResponse<void>> => {
  return axiosInstance.delete(`${BASE_URL}/${id}/items/${itemId}`);
};
