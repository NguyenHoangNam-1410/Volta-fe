import dayjs from "dayjs";

// ── Configuration ───────────────────────────────────────────────────────────

export const DAYS_OPTIONS = [7, 14, 30] as const;
export const ROW_OPTIONS = [10, 20, 50] as const;
export const STATUS_LIST = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
] as const;

// ── Styling ─────────────────────────────────────────────────────────────────

// Import these from admin.constants when using
export const createFieldSx = (colors: any) => ({
  minWidth: 130,
  "& .MuiOutlinedInput-root": {
    color: colors.text,
    bgcolor: colors.surface,
    "& fieldset": { borderColor: colors.border },
    "&:hover fieldset": { borderColor: colors.mid },
    "&.Mui-focused fieldset": { borderColor: colors.accent },
  },
  "& .MuiInputBase-input": {
    color: colors.text,
  },
  "& .MuiSelect-icon": {
    color: colors.dim,
  },
  "& .MuiInputLabel-root": {
    color: colors.dim,
    "&.Mui-focused": { color: colors.accent },
  },
});

// ── Helpers: Data Processing ────────────────────────────────────────────────

/**
 * Build stats request params based on filter mode
 */
export function buildStatsParams(
  filterMode: "manual" | "preset",
  startDate: string,
  endDate: string,
  days: number,
  recentLimit: number,
  topLimit: number,
) {
  const dateTimeStart = `${startDate} 00:00:00`;
  const dateTimeEnd = `${endDate} 23:59:59`;

  if (filterMode === "manual") {
    return {
      start_date: dateTimeStart,
      end_date: dateTimeEnd,
      recent_limit: recentLimit,
      top_limit: topLimit,
    };
  }

  return {
    days,
    recent_limit: recentLimit,
    top_limit: topLimit,
  };
}

/**
 * Build SWR key based on filter params
 */
export function buildSWRKey(
  filterMode: "manual" | "preset",
  startDate: string,
  endDate: string,
  days: number,
  recentLimit: number,
  topLimit: number,
) {
  const dateTimeStart = `${startDate} 00:00:00`;
  const dateTimeEnd = `${endDate} 23:59:59`;

  return [
    "order-stats",
    filterMode,
    dateTimeStart,
    dateTimeEnd,
    days,
    recentLimit,
    topLimit,
  ];
}

/**
 * Calculate KPI values from stats response
 */
export function calculateKPIs(statsResp: any) {
  const totalRevenue = statsResp?.total_revenue ?? 0;
  const totalOrders = statsResp?.total_orders ?? 0;
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const completedOrders = statsResp?.completed_orders ?? 0;

  return {
    totalRevenue,
    totalOrders,
    avgOrder,
    completedOrders,
  };
}

/**
 * Extract and process revenue chart data
 */
export function processRevenueChartData(statsResp: any) {
  const revenueSeries =
    (statsResp?.revenue_by_day?.length
      ? statsResp.revenue_by_day
      : statsResp?.revenue_last_7_days) ?? [];

  const weekBars = revenueSeries.map((p: any) => Number(p.amount ?? 0));
  const weekLabels = revenueSeries.map(
    (p: any) => p.day_of_week?.slice(0, 3) ?? dayjs(p.date).format("dd"),
  );
  const weekTooltips = revenueSeries.map(
    (p: any) =>
      `${dayjs(p.date).format("MMM D, YYYY")}: $${Number(p.amount ?? 0).toLocaleString()}`,
  );

  return { weekBars, weekLabels, weekTooltips };
}

/**
 * Generate date range label from effective filter data
 */
export function generateDateRangeLabel(
  effectiveStart: string | undefined,
  effectiveEnd: string | undefined,
  filterMode: "manual" | "preset",
  days: number,
  startDate: string,
  endDate: string,
) {
  if (effectiveStart && effectiveEnd) {
    return `${dayjs(effectiveStart).format("MMM D")} - ${dayjs(effectiveEnd).format("MMM D")}`;
  }

  if (filterMode === "preset") {
    return `Last ${days} days`;
  }

  return `${dayjs(startDate).format("MMM D")} - ${dayjs(endDate).format("MMM D")}`;
}

/**
 * Generate period subtitle based on effective filter mode
 */
export function generatePeriodSubtitle(
  effectiveMode: string | undefined,
  effectiveDays: number | undefined,
  days: number,
  dateRangeLabel: string,
  revenueWindowDays?: number,
) {
  if (effectiveMode === "last_n_days") {
    return `last ${effectiveDays ?? revenueWindowDays ?? days} days`;
  }

  return `range ${dateRangeLabel}`;
}

/**
 * Extract effective filter data from response
 */
export function extractEffectiveFilter(statsResp: any) {
  return {
    effectiveStart: statsResp?.effective_filter?.start_date,
    effectiveEnd: statsResp?.effective_filter?.end_date,
    effectiveMode: statsResp?.effective_filter?.mode,
    effectiveDays: statsResp?.effective_filter?.days,
  };
}

/**
 * Extract order and product data from stats response
 */
export function extractTableData(statsResp: any) {
  return {
    recentOrders: statsResp?.recent_orders ?? [],
    topProducts: statsResp?.top_products ?? [],
  };
}

// ── Default Initial Values ──────────────────────────────────────────────────

export function getInitialDateRange() {
  const now = dayjs();
  return {
    startDate: now.subtract(30, "day").format("YYYY-MM-DD"),
    endDate: now.format("YYYY-MM-DD"),
  };
}
