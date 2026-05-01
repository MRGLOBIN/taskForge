export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
