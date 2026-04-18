import React from "react";
import { TextField, Autocomplete, MenuItem } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { COLOR_BRAND } from "../constants/color.constant";

// ── Option type for dropdown / search-dropdown ──
export interface VTextFieldOption {
  label: string;
  value: string | number;
}

// ── Field type discriminator ──
export type VFieldType =
  | "text"
  | "number"
  | "date"
  | "password"
  | "dropdown"
  | "search-dropdown";

// ── Props ──
export interface VTextFieldProps {
  /** Which kind of input to render (default: 'text') */
  fieldType?: VFieldType;
  /** Field label shown above the input */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Current value */
  value?: string | number | null;
  /** Change handler – accepts both event and plain value */
  onChange?: (e: any) => void;
  /** Validation error message; truthy = error state */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Full width (default true) */
  fullWidth?: boolean;
  /** MUI size */
  size?: "small" | "medium";
  /** Required indicator */
  required?: boolean;
  /** HTML id */
  id?: string;
  /** Options for dropdown / search-dropdown */
  options?: VTextFieldOption[];
  /** Multiline for text fields */
  multiline?: boolean;
  /** Rows for multiline */
  rows?: number;
  /** HTML input type (overrides fieldType for standard inputs) */
  type?: string;
  /** Extra sx props */
  sx?: SxProps<Theme>;
}

/** Shared Volta brand styling for all text fields */
const voltaSx: SxProps<Theme> = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    fontFamily: "'Lato', sans-serif",
    color: COLOR_BRAND.light,
    "& input": {
      color: COLOR_BRAND.light,
      "&::placeholder": {
        color: COLOR_BRAND.mid,
        opacity: 0.7,
      },
    },
    "& textarea": {
      color: COLOR_BRAND.light,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: COLOR_BRAND.mid,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: COLOR_BRAND.bg,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: COLOR_BRAND.accent,
      borderWidth: "1.5px",
    },
  },
  "& .MuiInputLabel-root": {
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 700,
    fontSize: "13px",
    color: COLOR_BRAND.light,
    "&.Mui-focused": {
      color: COLOR_BRAND.accent,
    },
    "&.Mui-error": {
      color: "#ff4d4d",
    },
  },
  "& .MuiFormHelperText-root": {
    color: "#ff4d4d",
  },
};

/**
 * text | number | date | password | dropdown | search-dropdown
 */
export const VTextField: React.FC<VTextFieldProps> = ({
  fieldType = "text",
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  fullWidth = true,
  size = "small",
  required = false,
  id,
  options = [],
  multiline = false,
  rows = undefined,
  type: typeProp,
  sx: extraSx,
}) => {
  // Helper to handle both onChange signatures
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const finalValue =
      fieldType === "number" ? (raw === "" ? null : Number(raw)) : raw;

    // Try calling as event handler first, fallback to value handler
    if (onChange) {
      try {
        (onChange as any)(e);
      } catch {
        (onChange as any)(finalValue);
      }
    }
  };
  const mergedSx: SxProps<Theme> = [
    ...(Array.isArray(voltaSx) ? voltaSx : [voltaSx]),
    ...(extraSx ? (Array.isArray(extraSx) ? extraSx : [extraSx]) : []),
  ];

  // ── Search Dropdown (Autocomplete) ──
  if (fieldType === "search-dropdown") {
    const selectedOption = options.find((o) => o.value === value) ?? null;

    return (
      <Autocomplete
        id={id}
        options={options}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.label
        }
        value={selectedOption}
        onChange={(_e, newVal) => {
          if (!onChange) return;
          if (newVal === null) {
            (onChange as any)(null);
          } else if (typeof newVal === "string") {
            (onChange as any)(newVal);
          } else {
            (onChange as any)(newVal.value);
          }
        }}
        freeSolo
        disabled={disabled}
        fullWidth={fullWidth}
        size={size}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            required={required}
            error={!!error}
            helperText={error}
            sx={mergedSx}
          />
        )}
      />
    );
  }

  // ── Dropdown (Select) ──
  if (fieldType === "dropdown") {
    return (
      <TextField
        id={id}
        select
        label={label}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => {
          if (onChange) {
            try {
              (onChange as any)(e);
            } catch {
              (onChange as any)(e.target.value);
            }
          }
        }}
        error={!!error}
        helperText={error}
        disabled={disabled}
        fullWidth={fullWidth}
        size={size}
        required={required}
        sx={mergedSx}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  // ── Standard inputs (text | number | date | password) ──
  const inputTypeMap: Record<string, string> = {
    text: "text",
    number: "number",
    date: "date",
    password: "password",
  };

  return (
    <TextField
      id={id}
      type={typeProp || inputTypeMap[fieldType]}
      label={label}
      placeholder={placeholder}
      value={value ?? ""}
      onChange={handleChange}
      error={!!error}
      helperText={error}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      required={required}
      multiline={multiline}
      rows={rows}
      slotProps={{
        inputLabel: fieldType === "date" ? { shrink: true } : undefined,
      }}
      sx={mergedSx}
    />
  );
};
