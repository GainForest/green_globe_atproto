import { NextResponse } from "next/server";
import { getBigQueryClient } from "../bigquery";
import { BigQueryError } from "../types";

export async function GET() {
  try {
    const bigquery = getBigQueryClient();
    const datasetId = "green_globe_v2_development";

    // Get the dataset reference
    const dataset = bigquery.dataset(datasetId);

    // Get dataset metadata
    const [metadata] = await dataset.getMetadata();

    return NextResponse.json({
      success: true,
      location: metadata.location,
      datasetInfo: metadata,
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
