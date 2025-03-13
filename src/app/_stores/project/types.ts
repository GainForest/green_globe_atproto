export type Shapefile = {
  default: boolean;
  isReference: boolean;
  shortName: string;
};

export type Asset = {
  id: string;
  name: string;
  classification: string;
  awsCID: string;
  shapefile: Shapefile | null;
};

export type Project = {
  id: string;
  name: string;
  country: string;
  dataDownloadUrl: string;
  dataDownloadInfo: string;
  description: string;
  longDescription: string;
  stripeUrl: string;
  discordId: string | null;
  lat: number;
  lon: number;
  area: number;
  objective: string;
  assets: Asset[];
  communityMembers: unknown[];
  Wallet: unknown | null;
};

export type ProjectDetailsAPIResponse = {
  data: {
    project?: Project;
  };
  extensions: object;
};

export type ProjectPolygonAPIResponse = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id: string;
    geometry: GeoJSON.Point;
    properties: {
      name: string;
    };
  }>;
};

export type TreeFeatureProperties = {
  lat: number;
  lon: number;
  Height?: string;
  height?: string;
  diameter: string;
  species: string;
  dateMeasured?: string;
  dateOfMeasurement?: string;
  datePlanted?: string;
  "FCD-tree_records-tree_time"?: string;
  "FCD-tree_records-tree_photo"?: string;
  ID?: string;
  awsUrl: string;
  koboUrl: string;
  leafAwsUrl?: string;
  leafKoboUrl?: string;
  barkAwsUrl: string;
  barkKoboUrl: string;
  videoAwsUrl?: string;
  videoKoboUrl?: string;
  soundAwsUrl?: string;
  soundKoboUrl?: string;
  tree_photo?: string;
  Plant_Name?: string;
  DBH?: string;
};

export type TreeFeature = {
  type: "Feature";
  properties: TreeFeatureProperties;
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
};

export type NormalizedTreeFeature = TreeFeature & {
  id: number;
  properties: TreeFeatureProperties & {
    type: "measured-tree";
  };
};

export type MeasuredTreesGeoJSON<
  T extends TreeFeature | NormalizedTreeFeature = NormalizedTreeFeature
> = {
  type: "FeatureCollection";
  features: T[];
};
