import React, { useState } from "react";
import useSWR from "swr";
import {
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { ADMIN_COLOR, statusColor } from "../admin.constants";
import { VTable } from "../../../../common/components/VTable";
import type { VTableColumn } from "../../../../common/components/VTable";
import { getOrderStats } from "../../../../apis/orders/order.api";
import type {
  RecentOrderStat,
  TopProductStat,
} from "../../../../apis/orders/order.interface";
import dayjs from "dayjs";
import { KpiCard } from "./kpi-card.component";
import {
  DAYS_OPTIONS,
  ROW_OPTIONS,
  STATUS_LIST,
  createFieldSx,
  buildStatsParams,
  buildSWRKey,
  calculateKPIs,
  processRevenueChartData,
  generateDateRangeLabel,
  generatePeriodSubtitle,
  extractEffectiveFilter,
  extractTableData,
  getInitialDateRange,
} from "./dashboard.constant";

// Simple SVG bar chart (no external chart lib needed)
const BarChart: React.FC<{
  values: number[];
  labels: string[];
  tooltips?: string[];
}> = ({ values, labels, tooltips }) => {
  const max = Math.max(...values, 1);
  const isSparseData = values.length <= 17;
  const fixedBarWidth = 34;
  const gap = isSparseData ? 10 : 6;
  const contentWidth = Math.max(420, values.length * (fixedBarWidth + gap));

  return (
    <Box
      sx={{
        overflowX: "auto",
        overflowY: "hidden",
        pb: 0.5,
        scrollbarWidth: "thin",
        scrollbarColor: `${ADMIN_COLOR.accent} ${ADMIN_COLOR.surface}`,
        "&::-webkit-scrollbar": {
          height: 6,
        },
        "&::-webkit-scrollbar-track": {
          background: ADMIN_COLOR.surface,
          borderRadius: 999,
        },
        "&::-webkit-scrollbar-thumb": {
          background: ADMIN_COLOR.accent,
          borderRadius: 999,
          border: `1px solid ${ADMIN_COLOR.surface}`,
        },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: isSparseData
            ? `repeat(${Math.max(values.length, 1)}, minmax(0, 1fr))`
            : `repeat(${values.length}, ${fixedBarWidth}px)`,
          alignItems: "end",
          gap: `${gap}px`,
          height: 140,
          minWidth: isSparseData ? "100%" : `${contentWidth}px`,
          width: isSparseData ? "100%" : "max-content",
        }}
      >
        {values.map((v, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Tooltip
              title={tooltips?.[i] ?? `$${Number(v).toLocaleString()}`}
              arrow
              placement="top"
            >
              <Box
                sx={{
                  width: "100%",
                  height: `${(v / max) * 110}px`,
                  bgcolor: ADMIN_COLOR.accent,
                  borderRadius: "4px 4px 0 0",
                  transition: "height 0.6s ease",
                  minHeight: 4,
                  cursor: "pointer",
                }}
              />
            </Tooltip>
            <Typography sx={{ fontSize: 10, color: ADMIN_COLOR.dim }}>
              {labels[i]}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ── Table Column Definitions ────────────────────────────────────────────────

const getOrderColumns = (): VTableColumn<RecentOrderStat>[] => [
  {
    key: "order_id",
    label: "#",
    width: 60,
    render: (r) => (
      <Typography
        sx={{
          fontSize: 13,
          color: ADMIN_COLOR.accent,
          fontFamily: "monospace",
        }}
      >
        #{r.order_id}
      </Typography>
    ),
  },
  {
    key: "customer",
    label: "Customer",
    render: (r) => (
      <Typography sx={{ fontSize: 13, color: ADMIN_COLOR.text }}>
        {r.customer}
      </Typography>
    ),
  },
  {
    key: "total",
    label: "Total",
    render: (r) => (
      <Typography
        sx={{ fontFamily: "monospace", fontSize: 13, color: ADMIN_COLOR.text }}
      >
        ${Number(r.total).toFixed(2)}
      </Typography>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (r) => {
      const c = statusColor[r.status] ?? {
        bg: "rgba(136,136,136,0.12)",
        text: "#888",
      };
      return (
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
          }}
        >
          <Box
            sx={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              bgcolor: "currentColor",
            }}
          />
          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
        </Box>
      );
    },
  },
  {
    key: "date",
    label: "Date",
    render: (r) => (
      <Typography sx={{ fontSize: 12, color: ADMIN_COLOR.dim }}>
        {r.date ? dayjs(r.date).format("MMM D") : "—"}
      </Typography>
    ),
  },
];

const getProductColumns = (): VTableColumn<TopProductStat>[] => [
  {
    key: "product",
    label: "Product",
    render: (r) => (
      <Box>
        <Typography
          sx={{ fontSize: 13, fontWeight: 500, color: ADMIN_COLOR.text }}
        >
          {r.product}
        </Typography>
        <Typography
          sx={{ fontSize: 11, color: ADMIN_COLOR.dim, fontFamily: "monospace" }}
        >
          #{r.product_id}
        </Typography>
      </Box>
    ),
  },
  {
    key: "price",
    label: "Price",
    render: (r) => (
      <Typography
        sx={{ fontFamily: "monospace", fontSize: 13, color: ADMIN_COLOR.text }}
      >
        ${Number(r.price).toFixed(2)}
      </Typography>
    ),
  },
  {
    key: "sold_quantity",
    label: "Sold",
    render: (r) => (
      <Typography sx={{ fontSize: 13, color: ADMIN_COLOR.green }}>
        {r.sold_quantity}
      </Typography>
    ),
  },
  {
    key: "stock",
    label: "Stock",
    render: (r) => (
      <Typography
        sx={{
          fontSize: 13,
          color: r.stock < 10 ? ADMIN_COLOR.red : ADMIN_COLOR.dim,
        }}
      >
        {r.stock}
      </Typography>
    ),
  },
];

// ── Dashboard Tab ────────────────────────────────────────────────────────────

export const DashboardTab: React.FC = () => {
  const { startDate, endDate } = getInitialDateRange();
  const [curStartDate, setCurStartDate] = useState(startDate);
  const [curEndDate, setCurEndDate] = useState(endDate);
  const [days, setDays] = useState(14);
  const [filterMode, setFilterMode] = useState<"manual" | "preset">("preset");
  const [recentLimit, setRecentLimit] = useState(10);
  const [topLimit, setTopLimit] = useState(10);

  const FIELD_SX = createFieldSx(ADMIN_COLOR);

  const statsParams = buildStatsParams(
    filterMode,
    curStartDate,
    curEndDate,
    days,
    recentLimit,
    topLimit,
  );

  const swrKey = buildSWRKey(
    filterMode,
    curStartDate,
    curEndDate,
    days,
    recentLimit,
    topLimit,
  );

  const { data: statsResp } = useSWR(swrKey, () =>
    getOrderStats(statsParams).then((r) => r.data?.data),
  );

  // Extract & process data
  const { totalRevenue, totalOrders, avgOrder, completedOrders } =
    calculateKPIs(statsResp);
  const { recentOrders, topProducts } = extractTableData(statsResp);
  const { weekBars, weekLabels, weekTooltips } =
    processRevenueChartData(statsResp);
  const { effectiveStart, effectiveEnd, effectiveMode, effectiveDays } =
    extractEffectiveFilter(statsResp);

  const dateRangeLabel = generateDateRangeLabel(
    effectiveStart,
    effectiveEnd,
    filterMode,
    days,
    curStartDate,
    curEndDate,
  );

  const periodSubtitle = generatePeriodSubtitle(
    effectiveMode,
    effectiveDays,
    days,
    dateRangeLabel,
    statsResp?.revenue_window_days,
  );

  const orderColumns = getOrderColumns();
  const productColumns = getProductColumns();

  return (
    <Box sx={{ p: 3.5 }}>
      {/* Date range */}
      <Box
        sx={{
          mb: 2.5,
          p: 2,
          bgcolor: ADMIN_COLOR.surface,
          border: `1px solid ${ADMIN_COLOR.border}`,
          borderRadius: "10px",
          display: "flex",
          gap: 1.5,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            color: ADMIN_COLOR.dim,
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          Stats Range
        </Typography>
        <TextField
          type="date"
          size="small"
          label="Start"
          value={curStartDate}
          onChange={(e) => {
            const next = e.target.value;
            setFilterMode("manual");
            setCurStartDate(next);
            if (next > curEndDate) setCurEndDate(next);
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ ...FIELD_SX, minWidth: 170 }}
        />
        <TextField
          type="date"
          size="small"
          label="End"
          value={curEndDate}
          onChange={(e) => {
            const next = e.target.value;
            setFilterMode("manual");
            setCurEndDate(next);
            if (next < curStartDate) setCurStartDate(next);
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ ...FIELD_SX, minWidth: 170 }}
        />
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Revenue"
            icon="💰"
            value={`$${totalRevenue.toLocaleString()}`}
            change={periodSubtitle}
            up
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Orders"
            icon="📦"
            value={String(totalOrders)}
            change={periodSubtitle}
            up
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Avg. Order"
            icon="🛒"
            value={`$${avgOrder.toFixed(2)}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Completed"
            icon="✅"
            value={String(completedOrders)}
          />
        </Grid>
      </Grid>

      {/* Charts row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
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
                mb: 2,
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: ADMIN_COLOR.text,
                }}
              >
                Revenue — {dateRangeLabel}
              </Typography>
              <TextField
                select
                size="small"
                label="Days"
                value={days}
                onChange={(e) => {
                  setFilterMode("preset");
                  setDays(Number(e.target.value));
                }}
                sx={{ ...FIELD_SX, minWidth: 110 }}
              >
                {DAYS_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            {weekBars.length > 0 ? (
              <BarChart
                values={weekBars}
                labels={weekLabels}
                tooltips={weekTooltips}
              />
            ) : (
              <Typography sx={{ fontSize: 12, color: ADMIN_COLOR.dim }}>
                No revenue data in selected range.
              </Typography>
            )}
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              bgcolor: ADMIN_COLOR.surface,
              border: `1px solid ${ADMIN_COLOR.border}`,
              borderRadius: "10px",
              p: 2.5,
              height: "100%",
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: ADMIN_COLOR.text,
                mb: 2,
              }}
            >
              Recent Order Status
            </Typography>
            {STATUS_LIST.map((s) => {
              const c = statusColor[s];
              return (
                <Box
                  key={s}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: c.text,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: ADMIN_COLOR.dim,
                        textTransform: "capitalize",
                      }}
                    >
                      {s}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: c.text,
                      fontFamily: "monospace",
                    }}
                  >
                    {
                      recentOrders.filter(
                        (o: RecentOrderStat) => o.status === s,
                      ).length
                    }
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Grid>
      </Grid>

      {/* Tables row */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
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
                mb: 2,
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: ADMIN_COLOR.text,
                }}
              >
                Recent Orders
              </Typography>
              <TextField
                select
                size="small"
                label="Rows"
                value={recentLimit}
                onChange={(e) => setRecentLimit(Number(e.target.value))}
                sx={{ ...FIELD_SX, minWidth: 110 }}
              >
                {ROW_OPTIONS.map((option) => (
                  <MenuItem key={`recent-${option}`} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <VTable
              columns={orderColumns}
              data={recentOrders}
              sx={{ border: "none", borderRadius: 0 }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
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
                mb: 2,
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: ADMIN_COLOR.text,
                }}
              >
                Top Products
              </Typography>
              <TextField
                select
                size="small"
                label="Rows"
                value={topLimit}
                onChange={(e) => setTopLimit(Number(e.target.value))}
                sx={{ ...FIELD_SX, minWidth: 110 }}
              >
                {ROW_OPTIONS.map((option) => (
                  <MenuItem key={`top-${option}`} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <VTable
              columns={productColumns}
              data={topProducts}
              sx={{ border: "none", borderRadius: 0 }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
