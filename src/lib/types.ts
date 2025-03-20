type PaginatedApiResponseCatalog<T> = {
  success: {
    success: true;
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    data: T[];
  };
  error: {
    success: false;
    error: string;
  };
};

export type PaginatedApiResponse<T> =
  PaginatedApiResponseCatalog<T>[keyof PaginatedApiResponseCatalog<T>];
