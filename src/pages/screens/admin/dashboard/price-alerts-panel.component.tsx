import React, { useState } from "react";
import useSWR from "swr";
import { Box, Typography, Button, Tooltip, CircularProgress, Pagination } from "@mui/material";
import { ADMIN_COLOR } from "../admin.constants";
import { VTable, type VTableColumn } from "../../../../common/components/VTable";
import { getPriceAlerts } from "../../../../apis/products/price-alert.api";
import type { PriceAlert, PriceAlertType } from "../../../../apis/products/price-alert.interface";

interface PriceAlertsPanelProps {
  filterMode: "manual" | "preset";
  startDate: string;
  endDate: string;
  days: number;
}

const ALERT_COLORS: Record<PriceAlertType, { bg: string; text: string }> = {
  increase: { bg: "rgba(16, 185, 129, 0.12)", text: "#10B981" }, // Green
  decrease: { bg: "rgba(245, 158, 11, 0.12)", text: "#F59E0B" }, // Amber
  clearance: { bg: "rgba(239, 68, 68, 0.12)", text: "#EF4444" }, // Red
  review: { bg: "rgba(139, 92, 246, 0.12)", text: "#8B5CF6" }, // Purple
};

const ALERT_LABELS: Record<PriceAlertType, string> = {
  increase: "Increase Price",
  decrease: "Decrease Price",
  clearance: "Clearance",
  review: "Review Pricing",
};

export const PriceAlertsPanel: React.FC<PriceAlertsPanelProps> = ({
  filterMode,
  startDate,
  endDate,
  days,
}) => {
  const [activeTab, setActiveTab] = useState<PriceAlertType | "all">("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const handleTabChange = (tab: PriceAlertType | "all") => {
    setActiveTab(tab);
    setPage(1);
  };

  const params =
    filterMode === "manual"
      ? { start_date: `${startDate} 00:00:00`, end_date: `${endDate} 23:59:59` }
      : { days };

  const swrKey = [
    "price-alerts",
    filterMode,
    startDate,
    endDate,
    days,
  ];

  const { data: response, isLoading } = useSWR(swrKey, () =>
    getPriceAlerts(params).then((r) => r.data?.data)
  );

  const summary = response?.summary;
  const allAlerts = response?.alerts || [];
  
  const filteredAlerts =
    activeTab === "all"
      ? allAlerts
      : allAlerts.filter((a: PriceAlert) => a.alert_type === activeTab);

  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
  const paginatedAlerts = filteredAlerts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const columns: VTableColumn<PriceAlert>[] = [
    {
      key: "product",
      label: "Product",
      render: (r) => (
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: ADMIN_COLOR.text }}>
            {r.name}
          </Typography>
          <Typography sx={{ fontSize: 11, color: ADMIN_COLOR.dim, fontFamily: "monospace" }}>
            #{r.product_id}
          </Typography>
        </Box>
      ),
    },
    {
      key: "alert_type",
      label: "Recommendation",
      render: (r) => {
        const c = ALERT_COLORS[r.alert_type];
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.6,
                bgcolor: c.bg,
                color: c.text,
                fontSize: 11,
                fontWeight: 600,
                px: 1.25,
                py: 0.375,
                borderRadius: "50px",
                width: "fit-content",
              }}
            >
              <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "currentColor" }} />
              {ALERT_LABELS[r.alert_type]}
            </Box>
            <Typography sx={{ fontSize: 11, color: ADMIN_COLOR.dim }}>
              {r.recommended_action}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "price",
      label: "Current Price",
      render: (r) => (
        <Typography sx={{ fontFamily: "monospace", fontSize: 13, color: ADMIN_COLOR.text }}>
          ${Number(r.price).toFixed(2)}
        </Typography>
      ),
    },
    {
      key: "suggested",
      label: "Suggested",
      render: (r) => (
        <Typography
          sx={{
            fontFamily: "monospace",
            fontSize: 13,
            color: r.suggested_price ? ADMIN_COLOR.accent : ADMIN_COLOR.dim,
            fontWeight: r.suggested_price ? 600 : 400,
          }}
        >
          {r.suggested_price ? `$${Number(r.suggested_price).toFixed(2)}` : "—"}
        </Typography>
      ),
    },
    {
      key: "metrics",
      label: "Key Metrics",
      render: (r) => (
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Tooltip title="Sold Quantity" placement="top">
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Typography sx={{ fontSize: 10, color: ADMIN_COLOR.dim }}>Sold</Typography>
              <Typography sx={{ fontSize: 12, color: ADMIN_COLOR.text, fontFamily: "monospace" }}>
                {r.metrics.sold_quantity}
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip title="Current Stock" placement="top">
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Typography sx={{ fontSize: 10, color: ADMIN_COLOR.dim }}>Stock</Typography>
              <Typography sx={{ fontSize: 12, color: ADMIN_COLOR.text, fontFamily: "monospace" }}>
                {r.stock}
              </Typography>
            </Box>
          </Tooltip>
          {r.alert_type === "increase" || r.alert_type === "decrease" ? (
            <Tooltip title="Sell-through Rate" placement="top">
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography sx={{ fontSize: 10, color: ADMIN_COLOR.dim }}>STR</Typography>
                <Typography sx={{ fontSize: 12, color: ADMIN_COLOR.text, fontFamily: "monospace" }}>
                  {(r.metrics.sell_through_rate * 100).toFixed(1)}%
                </Typography>
              </Box>
            </Tooltip>
          ) : null}
          {r.alert_type === "review" ? (
            <Tooltip title="Cancellation Rate" placement="top">
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography sx={{ fontSize: 10, color: ADMIN_COLOR.dim }}>CXL</Typography>
                <Typography sx={{ fontSize: 12, color: ADMIN_COLOR.text, fontFamily: "monospace" }}>
                  {(r.metrics.cancel_rate * 100).toFixed(1)}%
                </Typography>
              </Box>
            </Tooltip>
          ) : null}
        </Box>
      ),
    },
    {
      key: "severity",
      label: "Severity",
      width: 80,
      render: (r) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {[1, 2, 3, 4, 5].map((lvl) => (
            <Box
              key={lvl}
              sx={{
                width: 6,
                height: 12,
                borderRadius: 1,
                bgcolor: lvl <= r.severity ? ALERT_COLORS[r.alert_type].text : ADMIN_COLOR.border,
              }}
            />
          ))}
        </Box>
      ),
    },
  ];

  return (
    <Box
      sx={{
        bgcolor: ADMIN_COLOR.surface,
        border: `1px solid ${ADMIN_COLOR.border}`,
        borderRadius: "10px",
        p: 2.5,
        mb: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              color: ADMIN_COLOR.text,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            Price Alerts & Recommendations
            {summary?.total ? (
              <Box
                sx={{
                  bgcolor: ADMIN_COLOR.accent,
                  color: ADMIN_COLOR.accentDark,
                  px: 1,
                  py: 0.25,
                  borderRadius: "50px",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {summary.total}
              </Box>
            ) : null}
          </Typography>
          <Typography sx={{ fontSize: 12, color: ADMIN_COLOR.dim, mt: 0.5 }}>
            Automated analysis of product performance based on the selected date range.
          </Typography>
        </Box>

        {/* Filters */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            onClick={() => handleTabChange("all")}
            sx={{
              bgcolor: activeTab === "all" ? ADMIN_COLOR.s2 : "transparent",
              color: activeTab === "all" ? ADMIN_COLOR.text : ADMIN_COLOR.dim,
              fontSize: 12,
              textTransform: "none",
              "&:hover": { bgcolor: ADMIN_COLOR.s2 },
            }}
          >
            All Alerts
          </Button>
          {(Object.keys(ALERT_LABELS) as PriceAlertType[]).map((type) => (
            <Button
              key={type}
              size="small"
              onClick={() => handleTabChange(type)}
              sx={{
                bgcolor: activeTab === type ? ALERT_COLORS[type].bg : "transparent",
                color: activeTab === type ? ALERT_COLORS[type].text : ADMIN_COLOR.dim,
                fontSize: 12,
                textTransform: "none",
                "&:hover": { bgcolor: ALERT_COLORS[type].bg },
                display: "flex",
                gap: 0.5,
              }}
            >
              {ALERT_LABELS[type]}
              {summary && summary[type] > 0 && (
                <Box
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    px: 0.75,
                    borderRadius: "50px",
                    fontSize: 10,
                  }}
                >
                  {summary[type]}
                </Box>
              )}
            </Button>
          ))}
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress size={24} sx={{ color: ADMIN_COLOR.accent }} />
        </Box>
      ) : filteredAlerts.length > 0 ? (
        <Box>
          <VTable columns={columns} data={paginatedAlerts} sx={{ border: "none", borderRadius: 0 }} />
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: ADMIN_COLOR.dim,
                  },
                  "& .Mui-selected": {
                    bgcolor: `${ADMIN_COLOR.accent} !important`,
                    color: `${ADMIN_COLOR.accentDark} !important`,
                  },
                }}
              />
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography sx={{ fontSize: 13, color: ADMIN_COLOR.dim }}>
            No price alerts found for the selected criteria.
          </Typography>
        </Box>
      )}
    </Box>
  );
};
