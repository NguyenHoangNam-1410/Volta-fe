import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { COLOR_BRAND } from "../constants/color.constant";

export interface VTableColumn<T> {
  key: string;
  label: string;
  width?: number | string;
  align?: "left" | "center" | "right";
  render?: (row: T, index: number) => React.ReactNode;
}

export interface VTableProps<T> {
  columns: VTableColumn<T>[];
  data: T[];
  onRowClick?: (row: T, index: number) => void;
  sx?: SxProps<Theme>;
}

const headCellSx: SxProps<Theme> = {
  fontSize: 11,
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  color: COLOR_BRAND.mid,
  borderBottom: "1px solid #262626",
  py: 1,
  px: 1.5,
  fontFamily: "'Roboto', sans-serif",
};

const bodyCellSx: SxProps<Theme> = {
  fontSize: 13,
  borderBottom: "1px solid #262626",
  py: 1.4,
  px: 1.5,
  color: "#e8e8e0",
};

export function VTable<T>({ columns, data, onRowClick, sx }: VTableProps<T>) {
  return (
    <Box
      sx={{
        bgcolor: "#141414",
        border: "1px solid #262626",
        borderRadius: "10px",
        overflow: "hidden",
        ...sx,
      }}
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#1a1a1a" }}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align ?? "left"}
                  sx={{ ...headCellSx, width: col.width }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow
                key={idx}
                onClick={() => onRowClick?.(row, idx)}
                sx={{
                  cursor: onRowClick ? "pointer" : "default",
                  "&:hover td": { bgcolor: "#1a1a1a" },
                  "&:last-child td": { borderBottom: "none" },
                }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    align={col.align ?? "left"}
                    sx={bodyCellSx}
                  >
                    {col.render
                      ? col.render(row, idx)
                      : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
