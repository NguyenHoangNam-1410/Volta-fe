import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { login } from "../../../apis/auths/auth.api";
import { VTextField } from "../../../common/components/VTextField";
import { COLOR_BRAND } from "../../../common/constants/color.constant";
import {
  handleApiError,
  handleApiSuccess,
} from "../../../common/utils/error-handler";
import { useSnackbar } from "../../../common/contexts/snackbar.context";
import { ROUTES } from "../../../routes/route.constant";
import {
  isAuthenticated,
  setAuthenticatedSession,
  setGuestSession,
} from "../../../common/utils/auth-session";

const PUBLIC_HOME_URL = "/volta/public";

export const LoginScreen: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      window.location.replace(PUBLIC_HOME_URL);
    }
  }, []);

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    // else if (password.length < 6) {
    //     newErrors.password = 'Password must be at least 6 characters';
    // }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await login({ email, password });
      const user = response.data;
      setAuthenticatedSession(user);
      handleApiSuccess(showSnackbar, "Signed in successfully.");
      window.location.assign(PUBLIC_HOME_URL);
    } catch (err: unknown) {
      handleApiError(
        err,
        showSnackbar,
        "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = (): void => {
    setGuestSession();
    showSnackbar("You are browsing as a guest.", "info");
    window.location.assign(PUBLIC_HOME_URL);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        bgcolor: COLOR_BRAND.bg,
      }}
    >
      {/* ── Left Brand Panel ── */}
      <Box
        sx={{
          bgcolor: COLOR_BRAND.dark,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 6,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -120,
            right: -80,
            width: 400,
            height: 400,
            background: COLOR_BRAND.accent,
            borderRadius: "50%",
            opacity: 0.06,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -100,
            left: -60,
            width: 300,
            height: 300,
            background: COLOR_BRAND.accent,
            borderRadius: "50%",
            opacity: 0.04,
          },
        }}
      >
        {/* Logo */}
        <Typography
          sx={{
            fontFamily: "'Roboto', sans-serif",
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "-0.5px",
            color: "#fff",
            zIndex: 1,
            "& span": {
              color: COLOR_BRAND.accent,
              background: "#1a1a1a",
              px: "6px",
              py: "2px",
              borderRadius: "4px",
            },
          }}
        >
          <span>V</span>OLTA
        </Typography>

        {/* Tagline */}
        <Box sx={{ zIndex: 1 }}>
          <Typography
            component="h1"
            sx={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "clamp(36px, 3.5vw, 52px)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-2px",
              color: "#fff",
              mb: 2.5,
              "& em": {
                fontStyle: "italic",
                fontWeight: 400,
                color: COLOR_BRAND.mid,
              },
            }}
          >
            Shop your <br />
            <em>dream,</em>
            <br />
            effortlessly.
          </Typography>
          <Typography
            sx={{
              color: COLOR_BRAND.mid,
              fontSize: 16,
              lineHeight: 1.6,
              maxWidth: 380,
            }}
          >
            An e-commerce platform for your dream. All - in - one solution to
            think of.
          </Typography>
        </Box>

        {/* Footer */}
        <Typography sx={{ color: "#444", fontSize: 13, zIndex: 1 }}>
          Volta &mdash; 2025. All rights reserved.
        </Typography>
      </Box>

      {/* ── Right Form Panel ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: "32px 20px", md: 6 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          {/* Tag */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              bgcolor: COLOR_BRAND.accent,
              color: COLOR_BRAND.dark,
              borderRadius: 50,
              px: 1.75,
              py: 0.75,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              mb: 3,
              "&::before": {
                content: '""',
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: COLOR_BRAND.dark,
              },
            }}
          >
            Welcome Back
          </Box>

          <Typography
            component="h2"
            sx={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-1px",
              color: COLOR_BRAND.dark,
              mb: 1,
            }}
          >
            Sign in
          </Typography>

          <Typography sx={{ color: COLOR_BRAND.light, fontSize: 15, mb: 4.5 }}>
            Enter your credentials to access the dashboard.
          </Typography>

          <form onSubmit={handleSubmit} noValidate>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <VTextField
                fieldType="text"
                id="login-email"
                label="Email"
                placeholder="you@company.com"
                value={email}
                onChange={(v) => {
                  setEmail(String(v ?? ""));
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                error={errors.email}
                required
              />

              <VTextField
                fieldType="password"
                id="login-password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(v) => {
                  setPassword(String(v ?? ""));
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                error={errors.password}
                required
              />

              <Button
                type="submit"
                disabled={loading}
                fullWidth
                disableElevation
                sx={{
                  bgcolor: COLOR_BRAND.dark,
                  color: COLOR_BRAND.accent,
                  borderRadius: 50,
                  py: 1.75,
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 15,
                  fontWeight: 500,
                  textTransform: "none",
                  mt: 1,
                  "&:hover": {
                    bgcolor: "#1a1a1a",
                    transform: "translateY(-2px)",
                  },
                  transition:
                    "transform 0.2s cubic-bezier(0.22,1,0.36,1), background 0.2s",
                  "&.Mui-disabled": {
                    bgcolor: COLOR_BRAND.dark,
                    color: COLOR_BRAND.accent,
                    opacity: 0.6,
                  },
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={22}
                    sx={{ color: COLOR_BRAND.accent }}
                  />
                ) : (
                  "Sign in"
                )}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 3.5, fontSize: 13, color: COLOR_BRAND.light }}>
            or
          </Divider>

          <Button
            fullWidth
            onClick={() => navigate(ROUTES.REGISTER)}
            sx={{
              bgcolor: "transparent",
              color: COLOR_BRAND.dark,
              border: `1.5px solid ${COLOR_BRAND.dark}`,
              borderRadius: 50,
              py: 1.5,
              fontFamily: "'Lato', sans-serif",
              fontSize: 15,
              fontWeight: 500,
              textTransform: "none",
              mb: 1.5,
              "&:hover": {
                bgcolor: "rgba(26,26,26,0.04)",
              },
            }}
          >
            Register
          </Button>

          <Button
            fullWidth
            onClick={handleContinueAsGuest}
            sx={{
              bgcolor: "transparent",
              color: COLOR_BRAND.dark,
              border: "1.5px solid #e0dfd8",
              borderRadius: 50,
              py: 1.5,
              fontFamily: "'Lato', sans-serif",
              fontSize: 15,
              fontWeight: 500,
              textTransform: "none",
              "&:hover": {
                borderColor: COLOR_BRAND.dark,
                bgcolor: "#fff",
              },
            }}
          >
            Continue as Guest
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
