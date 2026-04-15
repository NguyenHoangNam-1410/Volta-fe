export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    ADMIN: '/admin',

    // Customer
    SHOP: '/shop',
    PRODUCT_DETAIL: '/shop/:id',
    CART: '/cart',
    CHECKOUT: '/checkout',
    ORDER_SUCCESS: '/order-success',
    PROFILE: '/profile',
} as const;

export const ROUTE_LABELS = {
    [ROUTES.HOME]: 'Home',
    [ROUTES.LOGIN]: 'Login',
    [ROUTES.REGISTER]: 'Register',
    [ROUTES.ADMIN]: 'Admin',

    // Customer
    [ROUTES.SHOP]: 'Shop',
    [ROUTES.PRODUCT_DETAIL]: 'Product Detail',
    [ROUTES.CART]: 'Cart',
    [ROUTES.CHECKOUT]: 'Checkout',
    [ROUTES.ORDER_SUCCESS]: 'Order Success',
    [ROUTES.PROFILE]: 'Profile',
} as const;
