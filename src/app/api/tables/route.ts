import { NextResponse } from "next/server";
import { getBigQueryClient, ensureDatasetLocation } from "../bigquery";
import { BigQueryError } from "../types";

export async function GET() {
  try {
    await ensureDatasetLocation();
    const bigquery = getBigQueryClient();
    const datasetId = "green_globe_v2_development";

    // Get the dataset reference
    const dataset = bigquery.dataset(datasetId);

    // Get list of tables
    const [tables] = await dataset.getTables();

    // Extract table information
    const tableList = tables.map((table) => ({
      id: table.id,
      name: table.metadata.tableReference.tableId,
      type: table.metadata.type,
      creationTime: new Date(
        parseInt(table.metadata.creationTime)
      ).toISOString(),
    }));

    return NextResponse.json({
      success: true,
      count: tableList.length,
      tables: tableList,
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
