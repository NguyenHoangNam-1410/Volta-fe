import type { ApiResponse } from "../../common/interfaces/base-requestdto.interface";
import axiosInstance from "../../common/configs/axios.config";
import type { Cart, CheckOutCartResponse, DiscountApplyDto, DiscountApplyResponse, PlaceOrderDto, RequestAddToCartDto } from "./cart.interface";

export const addProductToCart = (body: RequestAddToCartDto): Promise<ApiResponse<number>> => {
    return axiosInstance.post('/cart/items', body);
};

export const deleteCart = (): Promise<ApiResponse<void>> => {
    return axiosInstance.delete('/cart');
};

export const getCart = (): Promise<ApiResponse<Cart>> => {
    return axiosInstance.get('/cart');
};

export const updateCartItem = (body: RequestAddToCartDto): Promise<ApiResponse<Omit<Cart, 'items'>>> => {
    return axiosInstance.put('/cart/items', body);
};

export const deleteCartItem = (itemId: number, itemType?: 'product' | 'bundle'): Promise<ApiResponse<Omit<Cart, 'items'>>> => {
    return axiosInstance.delete(`/cart/items/${itemId}`, {
        params: itemType === 'bundle' ? { item_type: 'bundle' } : undefined,
    });
};

export const checkoutCart = (): Promise<ApiResponse<CheckOutCartResponse>> => {
    return axiosInstance.get('/cart/checkout');
}

export const applyDiscount = (body: DiscountApplyDto): Promise<ApiResponse<DiscountApplyResponse>> => {
    return axiosInstance.post('/cart/apply-discount', body);
}

export const placeOrder = (body: PlaceOrderDto): Promise<ApiResponse<number>> => {
    return axiosInstance.post('/cart/place-order', body);
}