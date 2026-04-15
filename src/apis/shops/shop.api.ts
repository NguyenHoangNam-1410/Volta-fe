import type { ProductDetail, ShopRequestParam, ShopProductResponse, FeaturedBadge } from "./shop.interface";
import axiosInstance from "../../common/configs/axios.config";
import type { Category } from "../categories/category.interface";
import type { Product } from "../products/product.interface";
import type { ApiResponse } from "../../common/interfaces/base-requestdto.interface";

export const getShops = (params: ShopRequestParam): Promise<ApiResponse<ShopProductResponse>> => {
    return axiosInstance.get('/shop/products', {
        params: {
            search: params.search || '',
            page: params.page || 1,
            limit: params.limit || 10,
            category_id: params.category_id || ''
        }
    });
}

export const getShopProductById = (id: string): Promise<ApiResponse<ProductDetail>> => {
    return axiosInstance.get(`/shop/products/${id}`);
}

export const getShopCategories = (): Promise<ApiResponse<Category[]>> => {
    return axiosInstance.get('/shop/categories');
}

export const getFeaturedProducts = (param: FeaturedBadge): Promise<ApiResponse<Product[]>> => {
    return axiosInstance.get('/shop/featured', { params: { badge: param.badge, limit: param.limit } });
}