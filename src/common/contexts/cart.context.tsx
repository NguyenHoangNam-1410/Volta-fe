import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { getCart, addProductToCart, updateCartItem, deleteCartItem, deleteCart } from '../../apis/carts/cart.api';
import type { Cart, RequestAddToCartDto } from '../../apis/carts/cart.interface';

interface CartContextType {
    cart: Cart;
    loading: boolean;
    addToCart: (dto: RequestAddToCartDto) => Promise<void>;
    updateQty: (dto: RequestAddToCartDto) => Promise<void>;
    removeItem: (itemId: number, itemType?: 'product' | 'bundle') => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
}

const emptyCart: Cart = { items: [], subtotal: 0, count: 0 };

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
    children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cart, setCart] = useState<Cart>(emptyCart);
    const [loading, setLoading] = useState(false);

    const refreshCart = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getCart();
            const payload = (res as { data?: { data?: Cart } | Cart })?.data;
            const normalizedCart = payload && typeof payload === 'object' && 'data' in payload
                ? (payload.data ?? emptyCart)
                : (payload as Cart | undefined) ?? emptyCart;
            setCart({
                items: Array.isArray(normalizedCart.items) ? normalizedCart.items : [],
                subtotal: Number(normalizedCart.subtotal ?? 0),
                count: Number(normalizedCart.count ?? 0),
            });
        } catch {
            setCart(emptyCart);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const addToCart = useCallback(async (dto: RequestAddToCartDto) => {
        await addProductToCart(dto);
        await refreshCart();
    }, [refreshCart]);

    const updateQty = useCallback(async (dto: RequestAddToCartDto) => {
        await updateCartItem(dto);
        await refreshCart();
    }, [refreshCart]);

    const removeItem = useCallback(async (itemId: number, itemType?: 'product' | 'bundle') => {
        await deleteCartItem(itemId, itemType);
        await refreshCart();
    }, [refreshCart]);

    const clearCartFn = useCallback(async () => {
        await deleteCart();
        setCart(emptyCart);
    }, []);

    return (
        <CartContext.Provider value={{ cart, loading, addToCart, updateQty, removeItem, clearCart: clearCartFn, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components -- Hook is co-located with Provider
export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
