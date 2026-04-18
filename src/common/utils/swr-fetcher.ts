import type { AxiosResponse, AxiosError } from "axios";

/**
 * Generic fetcher for SWR that works with axios
 * Extracts data from AxiosResponse
 */
export const axiosFetcher = async <T>(url: string): Promise<T> => {
  const { default: axiosInstance } = await import("../configs/axios.config");
  const response: AxiosResponse<T> = await axiosInstance.get(url);
  return response.data;
};

/**
 * Fetcher with params for paginated requests
 */
export const axiosFetcherWithParams = async <
  T,
  P extends Record<string, unknown>,
>(
  key: [string, P],
): Promise<T> => {
  const [url, params] = key;
  const { default: axiosInstance } = await import("../configs/axios.config");
  const response: AxiosResponse<T> = await axiosInstance.get(url, { params });
  return response.data;
};

/**
 * Type for SWR error handling
 */
export type SwrError = AxiosError;

/**
 * Generate a stable cache key for paginated requests
 */
export const createPaginatedKey = <P extends Record<string, unknown>>(
  baseUrl: string,
  params: P,
): [string, P] => {
  return [baseUrl, params];
};
