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

    await ensureDatasetLocation();
    const bigquery = getBigQueryClient();
    const location = await ensureDatasetLocation();

    // Build the query with pagination
    const query = `
      SELECT 
        id,
        country,
        description,
        longDescription
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

    return NextResponse.json({
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
