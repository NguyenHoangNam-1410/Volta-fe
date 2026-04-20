import type { ApiResponse } from "../../common/interfaces/base-requestdto.interface";
import axiosInstance from "../../common/configs/axios.config";
import type {
  Cart,
  CheckOutCartResponse,
  DiscountApplyDto,
  DiscountApplyResponse,
  PlaceOrderDto,
  RequestAddToCartDto,
  CartItem
} from "./cart.interface";

export const addProductToCart = (
  body: RequestAddToCartDto,
): Promise<ApiResponse<number>> => {
  return axiosInstance.post("/cart/items", body);
};

export const deleteCart = (): Promise<ApiResponse<void>> => {
  return axiosInstance.delete("/cart");
};


export const getCart = async (): Promise<ApiResponse<Cart>> => {
  const res = await axiosInstance.get('/cart');
  const body = res.data as ApiResponse<Cart>;
  const cart = body?.data;
  if (!cart) return body;
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const origin = apiUrl ? new URL(apiUrl, window.location.origin).origin : window.location.origin;
  const mappedItems = cart.items.map((item: CartItem) => {
    const url_2 = item.image_url || '';
    if (!url_2 || /^https?:\/\//i.test(url_2)) {
      return item; // already absolute or empty
    }
    return {
      ...item,
      image_url: origin + '/Volta' + '/' + url_2,
    };
  });
  return {
    ...body,
    data: {
      ...cart,
      items: mappedItems,
    },
  };
};

export const updateCartItem = (
  body: RequestAddToCartDto,
): Promise<ApiResponse<Omit<Cart, "items">>> => {
  return axiosInstance.put("/cart/items", body);
};

export const deleteCartItem = (
  itemId: number,
  itemType?: "product" | "bundle",
): Promise<ApiResponse<Omit<Cart, "items">>> => {
  return axiosInstance.delete(`/cart/items/${itemId}`, {
    params: itemType === "bundle" ? { item_type: "bundle" } : undefined,
  });
};

export const checkoutCart = (): Promise<ApiResponse<CheckOutCartResponse>> => {
  return axiosInstance.get("/cart/checkout");
};

export const applyDiscount = (
  body: DiscountApplyDto,
): Promise<ApiResponse<DiscountApplyResponse>> => {
  return axiosInstance.post("/cart/apply-discount", body);
};

export const placeOrder = (
  body: PlaceOrderDto,
): Promise<ApiResponse<number>> => {
  return axiosInstance.post("/cart/place-order", body);
};
