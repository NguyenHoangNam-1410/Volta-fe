import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { register } from "../../../apis/auths/auth.api";
import { VTextField } from "../../../common/components/VTextField";
import { COLOR_BRAND } from "../../../common/constants/color.constant";
import {
  handleApiError,
  handleApiSuccess,
} from "../../../common/utils/error-handler";
import { useSnackbar } from "../../../common/contexts/snackbar.context";
import {
  isAuthenticated,
  setAuthenticatedSession,
} from "../../../common/utils/auth-session";
import { ROUTES } from "../../../routes/route.constant";

const PUBLIC_HOME_URL = "/volta/public";

export const RegisterScreen: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirm_password?: string;
    full_name?: string;
    phone?: string;
  }>({});

  useEffect(() => {
    if (isAuthenticated()) {
      window.location.replace(PUBLIC_HOME_URL);
    }
  }, []);

  const validate = (): boolean => {
    const nextErrors: {
      email?: string;
      password?: string;
      confirm_password?: string;
      full_name?: string;
      phone?: string;
    } = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = "Invalid email format";
    }

    if (!fullName.trim()) {
      nextErrors.full_name = "Full name is required";
    }

    if (!phone.trim()) {
      nextErrors.phone = "Phone is required";
    }

    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      nextErrors.confirm_password = "Confirm password is required";
    } else if (password !== confirmPassword) {
      nextErrors.confirm_password = "Passwords do not match";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await register({
        email,
        password,
        confirm_password: confirmPassword,
        full_name: fullName,
        phone,
      });

      setAuthenticatedSession(response.data);
      handleApiSuccess(showSnackbar, "Registered successfully.");
      window.location.assign(PUBLIC_HOME_URL);
    } catch (error: unknown) {
      handleApiError(error, showSnackbar, "Register failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <Typography
          sx={{
            fontFamily: "'Roboto', sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: "#fff",
            zIndex: 1,
          }}
        >
          <span style={{ color: COLOR_BRAND.accent }}>V</span>OLTA
        </Typography>

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
              mb: 2,
            }}
          >
            Create your
            <br />
            new account.
          </Typography>
          <Typography
            sx={{
              color: COLOR_BRAND.mid,
              fontSize: 16,
              lineHeight: 1.6,
              maxWidth: 380,
            }}
          >
            Register once and start your shopping dream.
          </Typography>
        </Box>

        <Typography sx={{ color: "#444", fontSize: 13, zIndex: 1 }}>
          Volta — 2025. All rights reserved.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: "32px 20px", md: 6 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
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
            Register
          </Typography>

          <Typography sx={{ color: COLOR_BRAND.light, fontSize: 15, mb: 3.5 }}>
            Fill out the form to create your account.
          </Typography>

          <form onSubmit={handleSubmit} noValidate>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <VTextField
                fieldType="text"
                id="register-full-name"
                label="Full name"
                placeholder="Your full name"
                value={fullName}
                onChange={(v) => {
                  setFullName(String(v ?? ""));
                  if (errors.full_name)
                    setErrors((prev) => ({ ...prev, full_name: undefined }));
                }}
                error={errors.full_name}
                required
              />

              <VTextField
                fieldType="text"
                id="register-phone"
                label="Phone"
                placeholder="Your phone number"
                value={phone}
                onChange={(v) => {
                  setPhone(String(v ?? ""));
                  if (errors.phone)
                    setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                error={errors.phone}
                required
              />

              <VTextField
                fieldType="text"
                id="register-email"
                label="Email"
                placeholder="you@example.com"
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
                id="register-password"
                label="Password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(v) => {
                  setPassword(String(v ?? ""));
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                error={errors.password}
                required
              />

              <VTextField
                fieldType="password"
                id="register-confirm-password"
                label="Confirm password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(v) => {
                  setConfirmPassword(String(v ?? ""));
                  if (errors.confirm_password)
                    setErrors((prev) => ({
                      ...prev,
                      confirm_password: undefined,
                    }));
                }}
                error={errors.confirm_password}
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
                  "Register"
                )}
              </Button>
            </Box>
          </form>

          <Button
            fullWidth
            onClick={() => navigate(ROUTES.LOGIN)}
            sx={{
              mt: 1.5,
              bgcolor: "transparent",
              color: COLOR_BRAND.dark,
              border: `1.5px solid ${COLOR_BRAND.dark}`,
              borderRadius: 50,
              py: 1.5,
              fontFamily: "'Lato', sans-serif",
              fontSize: 15,
              fontWeight: 500,
              textTransform: "none",
              "&:hover": {
                bgcolor: "rgba(26,26,26,0.04)",
              },
            }}
          >
            Back to Sign in
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
