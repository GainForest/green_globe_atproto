export interface BigQueryError extends Error {
  code?: string;
  details?: string;
  errors?: Array<{
    domain?: string;
    reason?: string;
    message?: string;
  }>;
}

export type Project = {
  id: string;
  country: string;
  description: string;
  endDate: string;
  startDate: string;
  objective: string;
  lat: string;
  lon: string;
};
