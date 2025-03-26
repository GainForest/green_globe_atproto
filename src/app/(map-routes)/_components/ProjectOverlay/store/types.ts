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

export type SiteAsset = {
  id: string;
  name: string;
  shapefile: Shapefile;
  awsCID: string;
  classification: "Shapefiles";
};

export type CommunityMember = {
  id: number;
  firstName: string;
  lastName: string;
  priority: number | null;
  role: string | null;
  bio: string | null;
  fundsReceived: number | null;
  profileUrl: string | null;
  Wallet: {
    CeloAccounts: string[] | null;
    SOLAccounts: string[] | null;
  } | null;
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
  objective?: string;
  assets: Asset[];
  communityMembers: CommunityMember[];
  Wallet: unknown | null;
};

export type ProjectDataApiResponse = {
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
