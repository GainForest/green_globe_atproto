import { NextResponse } from "next/server";
import { getBigQueryClient, ensureDatasetLocation } from "../../bigquery";
import { BigQueryError } from "../../types";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string } & Record<string, unknown>> }
) {
  try {
    const { id: userId } = await params;

    await ensureDatasetLocation();
    const bigquery = getBigQueryClient();
    const location = await ensureDatasetLocation();

    const query = `
      SELECT *
      FROM \`ecocertain.green_globe_v2_development.users\`
      WHERE id = @userId
      LIMIT 1
    `;

    // Using query parameters for security
    const options = {
      query,
      params: { userId },
      location: location || undefined,
    };

    const [rows] = await bigquery.query(options);

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
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
