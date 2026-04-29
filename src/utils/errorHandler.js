// Error handling utilities
export class ApiError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

export const handleApiError = (error) => {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof TypeError) {
    return {
      message: "Network error. Please check your connection.",
      code: "NETWORK_ERROR",
      statusCode: 0,
    };
  }

  return {
    message: error.message || "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
    statusCode: 500,
  };
};

export const getErrorMessage = (error, defaultMessage = "Something went wrong") => {
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.code) return `Error: ${error.code}`;
  return defaultMessage;
};

export const isNetworkError = (error) => {
  return error instanceof TypeError || error.code === "NETWORK_ERROR";
};

export const isAuthError = (error) => {
  const code = error?.code || error?.response?.data?.code;
  return code === "INVALID_CREDENTIALS" || code === "TOKEN_EXPIRED" || code === "NO_TOKEN";
};

export const isValidationError = (error) => {
  const code = error?.code || error?.response?.data?.code;
  return code === "MISSING_FIELDS" || code === "INVALID_EMAIL" || code === "WEAK_PASSWORD";
};
