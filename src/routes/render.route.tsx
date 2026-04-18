import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { routes } from "./route.routes";
import { ROUTES } from "./route.constant";
import { isAuthenticated } from "../common/utils/auth-session";

export const RenderRoutes: React.FC = () => {
  const authenticated = isAuthenticated();

  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            route.requiresAuth && !authenticated ? (
              <Navigate to={ROUTES.LOGIN} replace />
            ) : (
              <route.component />
            )
          }
        />
      ))}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};
