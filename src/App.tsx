import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box, ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";
import { Navbar } from "./pages/navbar/navbar.part";
import { RenderRoutes } from "./routes/render.route";
import { SnackbarProvider } from "./common/contexts/snackbar.context";
import { CartProvider } from "./common/contexts/cart.context";
import { LoginScreen } from "./pages/screens/login/login.screen";
import { RegisterScreen } from "./pages/screens/register/register.screen";
import { AdminScreen } from "./pages/screens/admin/admin.screen";
import { ROUTES } from "./routes/route.constant";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <CartProvider>
          <BrowserRouter basename="/">
            <Routes>
              <Route path={ROUTES.LOGIN} element={<LoginScreen />} />
              <Route path={ROUTES.REGISTER} element={<RegisterScreen />} />
              <Route path={ROUTES.ADMIN} element={<AdminScreen />} />
              <Route
                path="*"
                element={
                  <Box sx={{ minHeight: "100vh", bgcolor: "#ffffff" }}>
                    <Navbar />
                    <Box component="main">
                      <RenderRoutes />
                    </Box>
                  </Box>
                }
              />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
