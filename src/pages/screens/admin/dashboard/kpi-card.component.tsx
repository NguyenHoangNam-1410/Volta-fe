import React from "react";
import { Box, Typography } from "@mui/material";
import { ADMIN_COLOR } from "../admin.constants";

interface KpiCardProps {
  label: string;
  icon?: string;
  value: string;
  change?: string;
  up?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  icon,
  value,
  change,
  up,
}) => (
  <Box
    sx={{
      bgcolor: ADMIN_COLOR.surface,
      border: `1px solid ${ADMIN_COLOR.border}`,
      borderRadius: "10px",
      p: 2.5,
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 1.75,
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
          color: ADMIN_COLOR.dim,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Typography>
      {icon && <Typography sx={{ fontSize: 18 }}>{icon}</Typography>}
    </Box>
    <Typography
      sx={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 30,
        fontWeight: 800,
        letterSpacing: -1,
        color: ADMIN_COLOR.text,
        mb: 0.5,
      }}
    >
      {value}
    </Typography>
    {change && (
      <Typography sx={{ fontSize: 12, color: up ? ADMIN_COLOR.green : ADMIN_COLOR.red }}>
        {up ? "↑" : "↓"} {change}
      </Typography>
    )}
  </Box>
);
