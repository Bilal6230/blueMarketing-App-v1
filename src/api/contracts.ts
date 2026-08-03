export type ApiFieldErrors = Record<string, string[]>;

export type ApiSuccessResponse<T, M = Record<string, unknown>> = {
  status: true;
  message: string;
  data: T;
  meta: M;
};

export type ApiErrorResponse = {
  status: false;
  error_key: string;
  message: string;
  errors?: ApiFieldErrors;
};
