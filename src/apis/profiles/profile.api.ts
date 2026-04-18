import type {
  Address,
  RequestCreateAddressDto,
  UpdateProfileDto,
  UserProfile,
} from "./profile.interface";
import axiosInstance from "../../common/configs/axios.config";
import type { ApiResponse } from "../../common/interfaces/base-requestdto.interface";

const BASE_URL = "/profile";

export const getProfile = (): Promise<ApiResponse<UserProfile>> => {
  return axiosInstance.get(BASE_URL);
};

export const updateProfile = (
  body: UpdateProfileDto,
): Promise<ApiResponse<UserProfile>> => {
  return axiosInstance.put(BASE_URL, body);
};

export const getAllAddresses = (): Promise<ApiResponse<Address[]>> => {
  return axiosInstance.get(`${BASE_URL}/addresses`);
};

export const createAddress = (
  body: RequestCreateAddressDto,
): Promise<ApiResponse<Address>> => {
  return axiosInstance.post(`${BASE_URL}/addresses`, body);
};

export const updateAddress = (
  id: number,
  body: RequestCreateAddressDto,
): Promise<ApiResponse<Address>> => {
  return axiosInstance.put(`${BASE_URL}/addresses/${id}`, body);
};

export const deleteAddress = (id: number): Promise<ApiResponse<void>> => {
  return axiosInstance.delete(`${BASE_URL}/addresses/${id}`);
};
