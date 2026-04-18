import type { Category, RequestCreateCategoryDto } from "./category.interface";
import axiosInstance from "../../common/configs/axios.config";
import type { ApiResponse } from "../../common/interfaces/base-requestdto.interface";

const BASE_URL = "/categories";

export const getAllCategories = (): Promise<ApiResponse<Category[]>> => {
  return axiosInstance.get(BASE_URL);
};

export const createCategory = (
  body: RequestCreateCategoryDto,
): Promise<ApiResponse<Category>> => {
  return axiosInstance.post(BASE_URL, body);
};

export const getCategoryById = (id: number): Promise<ApiResponse<Category>> => {
  return axiosInstance.get(`${BASE_URL}/${id}`);
};

export const updateCategory = (
  id: number,
  body: RequestCreateCategoryDto,
): Promise<ApiResponse<Category>> => {
  return axiosInstance.put(`${BASE_URL}/${id}`, body);
};

export const deleteCategory = (id: number): Promise<ApiResponse<void>> => {
  return axiosInstance.delete(`${BASE_URL}/${id}`);
};
