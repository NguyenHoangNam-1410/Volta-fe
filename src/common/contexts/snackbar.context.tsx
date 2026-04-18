import React, { createContext, useContext, useCallback, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import type { SnackbarSeverity, ShowSnackbarFn } from "../utils/error-handler";

interface SnackbarContextType {
  showSnackbar: ShowSnackbarFn;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
);

interface SnackbarProviderProps {
  children: React.ReactNode;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({
  children,
}) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar: ShowSnackbarFn = useCallback(
    (msg: string, severity: SnackbarSeverity = "info") => {
      setSnackbar({ open: true, message: msg, severity });
    },
    [],
  );

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: "12px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

/**
 * Hook to access the snackbar functionality
 * @returns Object containing showSnackbar function
 * @throws Error if used outside of SnackbarProvider
 */
// eslint-disable-next-line react-refresh/only-export-components -- Hook is co-located with Provider, common pattern
export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};
