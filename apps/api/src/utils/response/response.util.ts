import type { ApiError, ApiSuccess } from "../../lib/types/api/api.types";

const isDev = process.env.NODE_ENV === "development";

export const successResponse = <T>(data: T): ApiSuccess<T> => {
  return {
    success: true,
    data,
  };
};

export const errorResponse = (
  message: string,
  errors?: Record<string, string[]>,
  stack?: string,
): ApiError => {
  return {
    success: false,
    message,
    errors,
    ...(isDev && stack ? { stack } : null),
  };
};
