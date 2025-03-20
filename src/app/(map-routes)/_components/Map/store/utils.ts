import { toKebabCase } from "@/lib/utils";
import { getTreeSpeciesName } from "../sources-and-layers/measured-trees";
import {
  MeasuredTreesGeoJSON,
  NormalizedTreeFeature,
  ProjectPolygonAPIResponse,
  TreeFeature,
} from "./types";

export const fetchPolygonByCID = async (cid: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AWS_STORAGE}/${cid}`
    );
    const data: ProjectPolygonAPIResponse = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchMeasuredTreesShapefile = async (
  projectName: string
): Promise<MeasuredTreesGeoJSON | null> => {
  const kebabCaseProjectName = toKebabCase(projectName);

  const endpoint = `shapefiles/${kebabCaseProjectName}-all-tree-plantings.geojson`;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AWS_STORAGE}/${endpoint}`
    );
    if (response.ok) {
      const result =
        (await response.json()) as MeasuredTreesGeoJSON<TreeFeature>;

      const normalizedFeatures: NormalizedTreeFeature[] = result.features.map(
        (feature, index: number) => ({
          ...feature,
          properties: {
            ...feature.properties,
            species: getTreeSpeciesName(feature.properties).trim(),
            type: "measured-tree",
          },
          id: index,
        })
      );
      const normalizedResult: MeasuredTreesGeoJSON = {
        ...result,
        features: normalizedFeatures,
      };
      return normalizedResult;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};
