import { ROUTES } from "./route.constant";
import type { ReactNode } from "react";

import { HomeScreen } from "../pages/screens/public/home.screen";
import { ShopScreen } from "../pages/screens/public/shop/shop.screen";
import { ProductDetailScreen } from "../pages/screens/public/product-detail/product-detail.screen";
import { CartScreen } from "../pages/screens/public/cart/cart.screen";
import { CheckoutScreen } from "../pages/screens/public/checkout/checkout.screen";
import { OrderSuccessScreen } from "../pages/screens/public/order-success/order-success.screen";
import { ProfileScreen } from "../pages/screens/public/profile/profile.screen";

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  label: string;
  icon?: ReactNode;
  requiresAuth?: boolean;
  hideFromNav?: boolean;
}

export const routes: RouteConfig[] = [
  { path: ROUTES.HOME, component: HomeScreen, label: "Home" },
  { path: ROUTES.SHOP, component: ShopScreen, label: "Shop" },
  {
    path: ROUTES.PRODUCT_DETAIL,
    component: ProductDetailScreen,
    label: "Product Detail",
    hideFromNav: true,
  },
  {
    path: ROUTES.CART,
    component: CartScreen,
    label: "Cart",
    requiresAuth: true,
    hideFromNav: true,
  },
  {
    path: ROUTES.CHECKOUT,
    component: CheckoutScreen,
    label: "Checkout",
    hideFromNav: true,
  },
  {
    path: ROUTES.ORDER_SUCCESS,
    component: OrderSuccessScreen,
    label: "Order Success",
    hideFromNav: true,
  },
  {
    path: ROUTES.PROFILE,
    component: ProfileScreen,
    label: "Profile",
    requiresAuth: true,
    hideFromNav: true,
  },
];
