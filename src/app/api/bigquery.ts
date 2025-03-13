import { BigQuery } from "@google-cloud/bigquery";

// Variable to store dataset location once discovered
let datasetLocation: string | null = null;

// Initialize BigQuery client
export const getBigQueryClient = () => {
  return new BigQuery({
    projectId: "ecocertain",
    credentials: JSON.parse(
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "{}"
    ),
  });
};

// Function to discover dataset location
export async function discoverDatasetLocation() {
  try {
    const bigquery = getBigQueryClient();
    const datasetId = "green_globe_v2_development";
    const dataset = bigquery.dataset(datasetId);
    const [metadata] = await dataset.getMetadata();
    datasetLocation = metadata.location;
    console.log(`Dataset location discovered: ${datasetLocation}`);
    return datasetLocation;
  } catch (error) {
    console.error("Error discovering dataset location:", error);
    // Default to US if we can't determine location
    return "US";
  }
}

// Ensure we have the dataset location
export async function ensureDatasetLocation(): Promise<string> {
  if (!datasetLocation) {
    datasetLocation = await discoverDatasetLocation();
  }
  // Return empty string instead of null to satisfy type requirements
  return datasetLocation || "";
}
