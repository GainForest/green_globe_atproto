export interface BigQueryError extends Error {
  code?: string;
  details?: string;
  errors?: Array<{
    domain?: string;
    reason?: string;
    message?: string;
  }>;
}
