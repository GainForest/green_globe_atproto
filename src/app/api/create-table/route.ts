import { NextResponse } from "next/server";
import { getBigQueryClient } from "../bigquery";
import { BigQueryError } from "../types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { datasetId, tableId, schema } = body;

    if (!datasetId || !tableId || !schema) {
      return NextResponse.json(
        {
          success: false,
          error: "Dataset ID, table ID, and schema are required",
        },
        { status: 400 }
      );
    }

    const bigquery = getBigQueryClient();

    // Get dataset reference
    const dataset = bigquery.dataset(datasetId);

    // Create table with the specified schema
    const [table] = await dataset.createTable(tableId, { schema });

    return NextResponse.json({
      success: true,
      message: `Table ${tableId} created in dataset ${datasetId}`,
      tableInfo: table.metadata,
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
