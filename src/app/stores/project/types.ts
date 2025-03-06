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
