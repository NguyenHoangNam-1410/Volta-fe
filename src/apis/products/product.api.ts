import axiosInstance from "../../common/configs/axios.config";
import type {
  CreateProductRelationDTO,
  Product,
  ProductImage,
  ProductRequestParam,
  RequestCreateProductDto,
} from "./product.interface";
import type {
  ApiResponse,
  PaginatedResponse,
} from "../../common/interfaces/base-requestdto.interface";
import type { ProductRelationType } from "./product.enum";

const BASE_URL = "products";

export const getProductById = (id: string): Promise<ApiResponse<Product>> => {
  return axiosInstance.get(`${BASE_URL}/${id}`);
};

export const getAllProduct = (
  params?: ProductRequestParam,
): Promise<ApiResponse<PaginatedResponse<Product>>> => {
  return axiosInstance.get(`${BASE_URL}`, {
    params: {
      search: params?.search || "",
      page: params?.page || 1,
      limit: params?.limit || 10,
    },
  });
};

export const createProduct = (
  product: RequestCreateProductDto,
): Promise<ApiResponse<Product>> => {
  return axiosInstance.post(`${BASE_URL}`, product);
};

export const updateProduct = (
  id: string,
  product: RequestCreateProductDto,
): Promise<ApiResponse<Product>> => {
  return axiosInstance.put(`${BASE_URL}/${id}`, product);
};

export const deleteProduct = (id: string): Promise<ApiResponse<void>> => {
  return axiosInstance.delete(`${BASE_URL}/${id}`);
};

export const getAllProductImage = (
  id: string,
): Promise<ApiResponse<ProductImage[]>> => {
  return axiosInstance.get(`${BASE_URL}/${id}/images`);
};

export const uploadProductImage = (
  id: string,
  imaged: File[],
): Promise<ApiResponse<ProductImage[]>> => {
  const formData = new FormData();
  imaged.forEach((image, index) => {
    formData.append(`images[${index}]`, image);
  });
  return axiosInstance.post(`${BASE_URL}/${id}/images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteProductImage = (
  id: string,
  imageId: string,
): Promise<ApiResponse<void>> => {
  return axiosInstance.delete(`${BASE_URL}/${id}/images/${imageId}`);
};

export const setProductImagePrimary = (
  id: string,
  imageId: string,
): Promise<ApiResponse<void>> => {
  return axiosInstance.put(`${BASE_URL}/${id}/images/${imageId}/primary`);
};

export const getProductRelations = (
  id: string,
  type: ProductRelationType,
): Promise<ApiResponse<Product[]>> => {
  return axiosInstance.get(`${BASE_URL}/${id}/relations`, {
    params: {
      type: type,
    },
  });
};

export const createProductRelation = (
  id: string,
  body: CreateProductRelationDTO,
): Promise<ApiResponse<void>> => {
  return axiosInstance.post(`${BASE_URL}/${id}/relations`, body);
};

export const deleteProductRelation = (
  id: string,
  related_id: string,
): Promise<ApiResponse<void>> => {
  return axiosInstance.delete(`${BASE_URL}/${id}/relations/${related_id}`);
};
