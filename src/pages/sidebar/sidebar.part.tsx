import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  Divider,
  Menu,
  MenuItem,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Typography,
} from "@mui/material";
import { routes } from "../../routes/route.routes";
import { COLORS, COLOR_BRAND } from "../../common/constants/color.constant";
import {
  clearSession,
  getStoredUser,
  isAuthenticated,
} from "../../common/utils/auth-session";

const DRAWER_WIDTH = 250;
const DRAWER_COLLAPSED_WIDTH = 80;
const PUBLIC_HOME_URL = "/volta/public";

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [accountAnchorEl, setAccountAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const navigate = useNavigate();
  const location = useLocation();
  const authenticated = isAuthenticated();
  const user = getStoredUser();
  const visibleRoutes = routes.filter(
    (route) => !route.requiresAuth || authenticated,
  );
  const primaryRoutes = visibleRoutes.filter(
    (route) => route.path !== "/admin" && !route.hideFromNav,
  );

  const width = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  const handleAdminClick = () => {
    navigate("/admin");
  };

  const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!authenticated) {
      navigate("/login");
      return;
    }

    setAccountAnchorEl(event.currentTarget);
  };

  const handleAccountClose = () => {
    setAccountAnchorEl(null);
  };

  const handleSignOut = () => {
    clearSession();
    handleAccountClose();
    navigate(PUBLIC_HOME_URL);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width,
          boxSizing: "border-box",
          background: COLOR_BRAND.dark,
          borderRight: "none",
          transition: "width 0.2s ease",
          overflowX: "hidden",
        },
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          background: "rgba(255,255,255,0.05)",
        }}
      >
        <img
          src={
            collapsed
              ? `${import.meta.env.BASE_URL}volta-mini.svg`
              : `${import.meta.env.BASE_URL}volta.svg`
          }
          alt="Volta Logo"
          style={{
            height: 32,
            transition: "all 0.2s",
            objectFit: "contain",
          }}
        />
      </Box>

      {/* Collapse toggle */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          justifyContent: collapsed ? "center" : "flex-end",
        }}
      >
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          size="small"
          sx={{ color: COLORS.white }}
        >
          {collapsed ? "\u25B6" : "\u25C0"}
        </IconButton>
      </Box>

      {/* Navigation */}
      <Box
        sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        <List sx={{ px: 1 }}>
          {primaryRoutes.map((route) => {
            const isActive = location.pathname === route.path;
            return (
              <ListItemButton
                key={route.path}
                selected={isActive}
                onClick={() => navigate(route.path)}
                sx={{
                  borderRadius: "10px",
                  mb: 0.5,
                  minHeight: 44,
                  justifyContent: collapsed ? "center" : "initial",
                  px: collapsed ? 1.5 : 2,
                  color: isActive ? COLOR_BRAND.accent : "#aaa",
                  "&.Mui-selected": {
                    backgroundColor: "rgba(232,255,71,0.08)",
                    "&:hover": {
                      backgroundColor: "rgba(232,255,71,0.12)",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.06)",
                  },
                }}
              >
                {!collapsed && (
                  <ListItemText
                    primary={route.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 400,
                      fontFamily: "'Lato', sans-serif",
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
          {/* Admin button - visible to all (not affected by redirects during development) */}
          <ListItemButton
            onClick={handleAdminClick}
            sx={{
              borderRadius: "10px",
              mb: 0.5,
              minHeight: 44,
              justifyContent: collapsed ? "center" : "initial",
              px: collapsed ? 1.5 : 2,
              color:
                location.pathname === "/admin" ? COLOR_BRAND.accent : "#aaa",
              mt: 1.25,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              pt: 1.5,
              "&.Mui-selected": {
                backgroundColor: "rgba(232,255,71,0.08)",
                "&:hover": {
                  backgroundColor: "rgba(232,255,71,0.12)",
                },
              },
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.06)",
              },
            }}
            selected={location.pathname === "/admin"}
          >
            {!collapsed && (
              <ListItemText
                primary="Admin"
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: location.pathname === "/admin" ? 600 : 400,
                  fontFamily: "'Lato', sans-serif",
                }}
              />
            )}
          </ListItemButton>
        </List>

        {/* Bottom fixed account area */}
        <Box
          sx={{
            mt: "auto",
            p: 1.25,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Box
            onClick={handleAccountClick}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              borderRadius: "10px",
              px: 1.25,
              py: 1,
              bgcolor: "rgba(255,255,255,0.03)",
              cursor: authenticated ? "default" : "pointer",
              "&:hover": {
                backgroundColor: authenticated
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(232,255,71,0.08)",
              },
            }}
          >
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                bgcolor: COLOR_BRAND.accent,
                color: COLOR_BRAND.dark,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Syne', sans-serif",
                fontSize: 12,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {authenticated
                ? (user?.full_name?.[0] ?? "U").toUpperCase()
                : "↪"}
            </Box>
            {!collapsed && (
              <Box sx={{ overflow: "hidden" }}>
                <Typography
                  sx={{
                    color: COLORS.white,
                    fontSize: 13,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                  noWrap
                >
                  {authenticated ? user?.full_name || "User" : "Sign in"}
                </Typography>
                <Typography
                  sx={{ color: "#aaa", fontSize: 11, whiteSpace: "nowrap" }}
                  noWrap
                >
                  {authenticated
                    ? user?.email || "Administrator"
                    : "Access your account"}
                </Typography>
              </Box>
            )}
          </Box>

          <Menu
            anchorEl={accountAnchorEl}
            open={Boolean(accountAnchorEl)}
            onClose={handleAccountClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "bottom", horizontal: "right" }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 180,
                bgcolor: "#141414",
                color: COLORS.white,
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleAccountClose();
              }}
              sx={{ fontSize: 13, color: COLOR_BRAND.light }}
            >
              Settings
            </MenuItem>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
            <MenuItem
              onClick={handleSignOut}
              sx={{ fontSize: 13, color: COLOR_BRAND.accent }}
            >
              Sign out
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Drawer>
  );
};
