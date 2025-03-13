import { NextResponse } from "next/server";
import { getBigQueryClient } from "../bigquery";
import { BigQueryError } from "../types";

export async function GET() {
  try {
    const bigquery = getBigQueryClient();

    const query = `
      SELECT name, COUNT(*) as count
      FROM \`bigquery-public-data.usa_names.usa_1910_2013\`
      WHERE state = 'TX'
      GROUP BY name
      ORDER BY count DESC
      LIMIT 10
    `;

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
