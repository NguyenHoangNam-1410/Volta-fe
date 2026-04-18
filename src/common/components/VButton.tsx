import React from "react";
import { Button as MuiButton, CircularProgress } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import {
  COLOR_BRAND,
  COLORS,
  BUTTON_COLORS,
} from "../constants/color.constant";

type VButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface VButtonProps {
  children: React.ReactNode;
  variant?: VButtonVariant;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  size?: "small" | "medium" | "large";
  sx?: SxProps<Theme>;
}

const variantStyles: Record<VButtonVariant, SxProps<Theme>> = {
  primary: {
    bgcolor: COLOR_BRAND.dark,
    color: COLOR_BRAND.accent,
    "&:hover": {
      bgcolor: BUTTON_COLORS.primaryHover,
      transform: "translateY(-1px)",
    },
  },
  secondary: {
    bgcolor: COLOR_BRAND.accent,
    color: COLOR_BRAND.dark,
    "&:hover": {
      bgcolor: BUTTON_COLORS.secondaryHover,
      transform: "translateY(-1px)",
    },
  },
  ghost: {
    bgcolor: "transparent",
    color: BUTTON_COLORS.ghostColor,
    border: `1px solid ${BUTTON_COLORS.ghostBorder}`,
    "&:hover": {
      bgcolor: BUTTON_COLORS.ghostHoverBg,
      borderColor: BUTTON_COLORS.ghostHoverBorder,
    },
  },
  danger: {
    bgcolor: BUTTON_COLORS.dangerBg,
    color: COLORS.white,
    "&:hover": {
      bgcolor: BUTTON_COLORS.dangerHoverBg,
      transform: "translateY(-1px)",
    },
  },
};

const sizeStyles: Record<string, SxProps<Theme>> = {
  small: { px: 1.5, py: 0.625, fontSize: 12 },
  medium: { px: 2.25, py: 1.125, fontSize: 13 },
  large: { px: 3.5, py: 1.75, fontSize: 15 },
};

export const VButton: React.FC<VButtonProps> = ({
  children,
  variant = "primary",
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  type = "button",
  size = "medium",
  sx,
}) => {
  return (
    <MuiButton
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      disableElevation
      sx={[
        {
          borderRadius: "8px",
          fontWeight: 500,
          textTransform: "none",
          fontFamily: "'Roboto', sans-serif",
          transition: "transform 0.15s, background 0.15s",
          minWidth: 0,
          ...variantStyles[variant],
          ...sizeStyles[size],
          "&.Mui-disabled": {
            opacity: 0.5,
            ...variantStyles[variant],
          },
        },
        ...(sx ? (Array.isArray(sx) ? sx : [sx]) : []),
      ]}
    >
      {loading ? (
        <CircularProgress size={18} sx={{ color: "inherit" }} />
      ) : (
        children
      )}
    </MuiButton>
  );
};
