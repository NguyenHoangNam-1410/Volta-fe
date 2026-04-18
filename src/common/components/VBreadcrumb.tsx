import React from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs, Link, Typography } from "@mui/material";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface VBreadcrumbProps {
  items: BreadcrumbItem[];
}

export const VBreadcrumb: React.FC<VBreadcrumbProps> = ({ items }) => {
  const navigate = useNavigate();

  return (
    <Breadcrumbs
      sx={{
        mb: 3,
        "& .MuiBreadcrumbs-separator": { color: "#ccc" },
      }}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        if (isLast || !item.path) {
          return (
            <Typography
              key={idx}
              sx={{
                fontSize: 13,
                color: isLast ? "#1a1a1a" : "#999",
                fontWeight: isLast ? 500 : 400,
              }}
            >
              {item.label}
            </Typography>
          );
        }
        return (
          <Link
            key={idx}
            underline="hover"
            sx={{
              fontSize: 13,
              color: "#999",
              cursor: "pointer",
              "&:hover": { color: "#555" },
            }}
            onClick={() => navigate(item.path!)}
          >
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};
