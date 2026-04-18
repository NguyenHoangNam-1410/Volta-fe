import type {
  ProductDetail,
  ShopRequestParam,
  ShopProductResponse,
  FeaturedBadge,
} from "./shop.interface";
import axiosInstance from "../../common/configs/axios.config";
import type { Category } from "../categories/category.interface";
import type { Product, ProductImage } from "../products/product.interface";
import type { ApiResponse } from "../../common/interfaces/base-requestdto.interface";

export const getShops = (
  params: ShopRequestParam,
): Promise<ApiResponse<ShopProductResponse>> => {
  return axiosInstance.get("/shop/products", {
    params: {
      search: params.search || "",
      page: params.page || 1,
      limit: params.limit || 10,
      category_id: params.category_id || "",
    },
  });
};

export const getShopProductById = async (
  id: string,
): Promise<ApiResponse<ProductDetail>> => {
  const res = await axiosInstance.get(`/shop/products/${id}`);
  const body = res.data as any; // original ApiResponse<ProductDetail>
  const detail = body?.data ?? null;
  if (!detail) return body as ApiResponse<ProductDetail>;
  const apiBase = import.meta.env.VITE_API_URL.replace("/api", "");
  if (Array.isArray(detail.images)) {
    const mapped = (detail.images as ProductImage[]).map((img) => {
      const url_2 = img?.url || "";
      // remove leading "public"
      const cleaned = url_2.replace("public", "");

      // build absolute URL using apiBase and /public prefix
      return { ...img, url: apiBase + cleaned };
    });

    return {
      ...body,
      data: {
        ...detail,
        images: mapped,
      },
    } as ApiResponse<ProductDetail>;
  }
  return body as ApiResponse<ProductDetail>;
};

export const getShopCategories = (): Promise<ApiResponse<Category[]>> => {
  return axiosInstance.get("/shop/categories");
};

export const getFeaturedProducts = (
  param: FeaturedBadge,
): Promise<ApiResponse<Product[]>> => {
  return axiosInstance.get("/shop/featured", {
    params: { badge: param.badge, limit: param.limit },
  });
};
