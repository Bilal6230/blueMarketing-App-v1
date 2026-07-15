export type ApiSuccess<TData, TMeta = Record<string, unknown>> = {
  status: true;
  message: string;
  data: TData;
  meta: TMeta;
};

export type ApiErrorResponse = {
  status: false;
  error_key?: string;
  error?: string;
  message: string;
  errors?: Record<string, string[]>;
};

export type AppApiError = {
  statusCode: number | null;
  errorKey: string;
  message: string;
  validationErrors: Record<string, string[]>;
  requestId?: string;
  retryable: boolean;
};
