import { AxiosError } from "axios";

/**
 * Backend error response structure - single error format
 */
export interface BackendErrorResponse {
  success?: boolean;
  message?: string;
  error?: {
    code: string | null;
    message: string | null;
    details: string | null;
    data: unknown | null;
    validationErrors: ValidationError[] | null;
  };
  // Alternative format: array of errors
  errors?: Array<{
    code: number | string;
    message: string;
  }>;
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Snackbar severity types
 */
export type SnackbarSeverity = "success" | "error" | "warning" | "info";

/**
 * Snackbar function type - can be from MUI or Ant Design
 */
export type ShowSnackbarFn = (
  message: string,
  severity?: SnackbarSeverity,
) => void;

/**
 * Extracts error message from backend error response
 * @param error - The error object from axios catch
 * @returns The error message string or null if not found
 */
export const extractErrorMessage = (error: unknown): string | null => {
  if (!error) return null;

  // Handle Axios error with backend response
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<BackendErrorResponse>;
    const responseData = axiosError.response?.data;

    // Handle { success: false, message: "..." } format
    if (responseData?.message) {
      return responseData.message;
    }

    // Handle "errors" array format: { errors: [{ code, message }] }
    if (
      responseData?.errors &&
      Array.isArray(responseData.errors) &&
      responseData.errors.length > 0
    ) {
      // Return first error message, or join all messages
      const messages = responseData.errors
        .map((e) => e.message)
        .filter(Boolean);
      if (messages.length > 0) {
        return messages.join("; ");
      }
    }

    // Handle "error" object format: { error: { code, message, ... } }
    const backendError = responseData?.error;
    if (backendError) {
      // Return the main error message
      if (backendError.message) {
        return backendError.message;
      }

      // If there are validation errors, format them
      if (
        backendError.validationErrors &&
        backendError.validationErrors.length > 0
      ) {
        return backendError.validationErrors
          .map((ve) => `${ve.field}: ${ve.message}`)
          .join(", ");
      }

      // Return details if available
      if (backendError.details) {
        return backendError.details;
      }
    }

    // Fallback to axios error message
    if (axiosError.message) {
      return axiosError.message;
    }
  }

  // Handle standard Error object
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string error
  if (typeof error === "string") {
    return error;
  }

  return null;
};

/**
 * Type guard to check if error is an AxiosError
 */
const isAxiosError = (error: unknown): error is AxiosError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as AxiosError).isAxiosError === true
  );
};

/**
 * Handles API errors by extracting the message and showing a snackbar
 * @param error - The error caught from the API call
 * @param showSnackbar - Function to show the snackbar notification
 * @param defaultMessage - Default message to show if error extraction fails
 */
export const handleApiError = (
  error: unknown,
  showSnackbar: ShowSnackbarFn,
  defaultMessage: string = "An unexpected error occurred",
): void => {
  const errorMessage = extractErrorMessage(error) || defaultMessage;
  showSnackbar(errorMessage, "error");

  // Also log to console for debugging
  console.error("API Error:", error);
};

/**
 * Handles API success by showing a snackbar
 * @param showSnackbar - Function to show the snackbar notification
 * @param message - Success message to display
 */
export const handleApiSuccess = (
  showSnackbar: ShowSnackbarFn,
  message: string,
): void => {
  showSnackbar(message, "success");
};
