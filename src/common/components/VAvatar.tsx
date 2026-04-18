import React from "react";
import { Avatar as MuiAvatar, Typography, Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { COLOR_BRAND } from "../constants/color.constant";

export interface VAvatarProps {
  name: string;
  subtitle?: string;
  size?: "small" | "medium" | "large";
  color?: string;
  sx?: SxProps<Theme>;
}

const sizes: Record<
  string,
  { avatar: number; initials: number; name: number; subtitle: number }
> = {
  small: { avatar: 28, initials: 11, name: 13, subtitle: 11 },
  medium: { avatar: 36, initials: 13, name: 14, subtitle: 12 },
  large: { avatar: 48, initials: 16, name: 16, subtitle: 13 },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const VAvatar: React.FC<VAvatarProps> = ({
  name,
  subtitle,
  size = "medium",
  color = COLOR_BRAND.accent,
  sx,
}) => {
  const s = sizes[size];

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, ...sx }}>
      <MuiAvatar
        sx={{
          width: s.avatar,
          height: s.avatar,
          bgcolor: color,
          color: COLOR_BRAND.dark,
          fontSize: s.initials,
          fontWeight: 700,
          fontFamily: "'Roboto', sans-serif",
        }}
      >
        {getInitials(name)}
      </MuiAvatar>
      <Box>
        <Typography
          sx={{
            fontSize: s.name,
            fontWeight: 500,
            color: "#e8e8e0",
            lineHeight: 1.3,
          }}
        >
          {name}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: s.subtitle, color: "#888" }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
