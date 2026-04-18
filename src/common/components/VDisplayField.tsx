import React from "react";
import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";

export interface VDisplayFieldProps {
  label: string;
  value: React.ReactNode;
  size?: "small" | "medium" | "large";
  sx?: SxProps<Theme>;
}

const valueFontSizes: Record<string, number> = {
  small: 14,
  medium: 18,
  large: 28,
};

export const VDisplayField: React.FC<VDisplayFieldProps> = ({
  label,
  value,
  size = "medium",
  sx,
}) => {
  return (
    <Box sx={sx}>
      <Typography
        sx={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          color: "#888",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "'Roboto', sans-serif",
          fontWeight: 700,
          fontSize: valueFontSizes[size],
          letterSpacing: size === "large" ? "-1px" : "-0.5px",
          color: "#e8e8e0",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};
