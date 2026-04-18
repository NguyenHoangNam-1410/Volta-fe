import type {
  RequestLoginDto,
  RequestRegisterDto,
  AuthUserPayload,
} from "./auth.interface";
import type { User } from "../users/user.interface";
import axiosInstance from "../../common/configs/axios.config";
import type { ApiResponse } from "../../common/interfaces/base-requestdto.interface";

const normalizeUserResponse = (response: {
  data: ApiResponse<AuthUserPayload | User>;
}): ApiResponse<User> => {
  const apiResponse = response.data;
  const payload = apiResponse.data as AuthUserPayload | User;
  const user = (payload as AuthUserPayload).user ?? (payload as User);
  return {
    ...apiResponse,
    data: user,
  };
};

export const login = async (
  request: RequestLoginDto,
): Promise<ApiResponse<User>> => {
  const response = await axiosInstance.post<
    ApiResponse<AuthUserPayload | User>
  >("/login", request);
  return normalizeUserResponse(response);
};

export const register = async (
  request: RequestRegisterDto,
): Promise<ApiResponse<User>> => {
  const response = await axiosInstance.post<
    ApiResponse<AuthUserPayload | User>
  >("/register", request);
  return normalizeUserResponse(response);
};

export const logout = () => {
  return axiosInstance.post(`/logout`);
};

export const me = async (): Promise<ApiResponse<User>> => {
  const response =
    await axiosInstance.get<ApiResponse<AuthUserPayload | User>>("/me");
  return normalizeUserResponse(response);
};
