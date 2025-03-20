import { getBigQueryClient, ensureDatasetLocation } from "../bigquery";
import { BigQueryError } from "../types";

export type ProjectsParams = {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: "ASC" | "DESC";
};

export type ProjectsResponse = {
  success: boolean;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  data?: unknown[];
  error?: string;
};

/**
 * Server action to fetch projects directly from BigQuery
 * This can be used by server components without making an API call
 */
export async function getProjects(
  params: ProjectsParams = {}
): Promise<ProjectsResponse> {
  try {
    // Set default values
    const page = params.page || 1;
    const pageSize = params.pageSize || 100;
    const offset = (page - 1) * pageSize;
    const sortField = params.sortField || "id"; // Default sort by id
    const sortOrder = params.sortOrder || "ASC";

    await ensureDatasetLocation();
    const bigquery = getBigQueryClient();
    const location = await ensureDatasetLocation();

    // Build the query with pagination
    const query = `
      SELECT 
        id,
        country,
        description,
        longDescription,
        endDate,
        startDate,
        objective,
        lat,
        lon
      FROM \`ecocertain.green_globe_v2_development.project\`
      ORDER BY ${sortField} ${sortOrder}
      LIMIT ${pageSize}
      OFFSET ${offset}
    `;

    // Query to get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM \`ecocertain.green_globe_v2_development.project\`
    `;

    // Run both queries in parallel
    const [rows] = await bigquery.query({
      query,
      location: location || undefined,
    });
    const [countResults] = await bigquery.query({
      query: countQuery,
      location: location || undefined,
    });
    const totalProjects = countResults[0].total;
    const totalPages = Math.ceil(totalProjects / pageSize);

    return {
      success: true,
      pagination: {
        total: totalProjects,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: rows,
    };
  } catch (error: unknown) {
    console.error("BigQuery error:", error);
    const bigQueryError = error as BigQueryError;
    return {
      success: false,
      error: bigQueryError.message,
    };
  }
}
