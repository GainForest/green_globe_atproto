import { NextResponse } from "next/server";
import { getBigQueryClient } from "../bigquery";
import { BigQueryError } from "../types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dataset, table, limit = 10, orderBy, filters } = body;

    if (!dataset || !table) {
      return NextResponse.json(
        {
          success: false,
          error: "Dataset and table are required",
        },
        { status: 400 }
      );
    }

    const bigquery = getBigQueryClient();

    let query = `SELECT * FROM \`${bigquery.projectId}.${dataset}.${table}\``;

    // Add WHERE clause if filters provided
    if (filters && Object.keys(filters).length > 0) {
      const whereConditions = Object.entries(filters)
        .map(([field, value]) => `${field} = "${value}"`)
        .join(" AND ");

      query += ` WHERE ${whereConditions}`;
    }

    // Add ORDER BY if provided
    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }

    // Add LIMIT
    query += ` LIMIT ${limit}`;

    // Run the query
    const [rows] = await bigquery.query({ query });

    return NextResponse.json({
      success: true,
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
