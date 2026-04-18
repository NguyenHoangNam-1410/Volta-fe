export interface BaseRequestDto {
  [key: string]: unknown;
  keySearch?: string;
  sortBy?: string;
  sortDescending?: boolean;
  fromDate?: string;
  toDate?: string;
  count?: number;
  skip?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface BaseRequestParam {
  search?: string;
  page?: number;
  limit?: number;
}
