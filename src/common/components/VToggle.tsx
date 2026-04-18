import React from "react";
import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { BUTTON_COLORS, COLOR_BRAND } from "../constants/color.constant";

export interface VToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

export const VToggle: React.FC<VToggleProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  sx,
}) => {
  return (
    <Box
      onClick={() => !disabled && onChange(!checked)}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...sx,
      }}
    >
      {label && (
        <Typography sx={{ fontSize: 13, color: BUTTON_COLORS.ghostColor }}>
          {label}
        </Typography>
      )}
      <Box
        sx={{
          width: 36,
          height: 20,
          borderRadius: 50,
          bgcolor: checked ? COLOR_BRAND.accent : BUTTON_COLORS.ghostHoverBg,
          position: "relative",
          flexShrink: 0,
          transition: "background 0.2s",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 3,
            width: 14,
            height: 14,
            borderRadius: "50%",
            bgcolor: checked ? COLOR_BRAND.dark : "#888",
            transition: "left 0.2s, right 0.2s",
            ...(checked ? { right: 3 } : { left: 3 }),
          }}
        />
      </Box>
    </Box>
  );
};
