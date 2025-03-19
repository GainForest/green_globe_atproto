import { NextResponse } from "next/server";
import { getBigQueryClient, ensureDatasetLocation } from "../bigquery";
import { BigQueryError } from "../types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get pagination parameters from query string
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "100");
    const offset = (page - 1) * pageSize;

    // Get sorting parameters (optional)
    const sortField = searchParams.get("sortField") || "id"; // Default sort by id
    const sortOrder =
      searchParams.get("sortOrder")?.toUpperCase() === "DESC" ? "DESC" : "ASC";

    // Get optional projectId filter
    const projectId = searchParams.get("projectId");
    const whereClause = projectId ? `WHERE project_id = '${projectId}'` : '';

    await ensureDatasetLocation();
    const bigquery = getBigQueryClient();
    const location = await ensureDatasetLocation();

    // Build the query with pagination and optional filter
    const query = `
      SELECT *
      FROM \`ecocertain.green_globe_v2_development.users\`
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT ${pageSize}
      OFFSET ${offset}
    `;

    // Query to get total count with optional filter
    const countQuery = `
      SELECT COUNT(*) as total
      FROM \`ecocertain.green_globe_v2_development.users\`
      ${whereClause}
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
    const totalUsers = countResults[0].total;
    const totalPages = Math.ceil(totalUsers / pageSize);

    return NextResponse.json({
      success: true,
      pagination: {
        total: totalUsers,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: rows,
    });
  } catch (error: unknown) {
    console.error("BigQuery error:", error);
    const bigQueryError = error as BigQueryError;
    return NextResponse.json(
      {
        success: false,
        error: bigQueryError.message,
      },
      { status: 500 }
    );
  }
}
