import { toKebabCase } from "@/lib/utils";
import { BiodiversityAnimal, BiodiversityPlant } from "./types";
import * as d3 from "d3";

export const fetchPlantsData = async (
  projectName: string,
  type: "Trees" | "Herbs"
) => {
  // For DID-based projects (ATproto), return empty data
  if (projectName.startsWith('did:plc:')) {
    console.log(`[fetchPlantsData] Returning empty data for DID project: ${projectName} (${type})`);
    return {
      items: [],
    };
  }

  const kebabCasedProjectName = toKebabCase(projectName);
  try {
    const filename = `${kebabCasedProjectName}-${type.toLowerCase()}.json`;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AWS_STORAGE}/restor/${filename}`
    );
    const data: { items: BiodiversityPlant[] } = await response.json();
    const hasImage = (obj: BiodiversityPlant) =>
      obj.awsUrl && obj.awsUrl.trim() !== "";
    const sortedData = data.items.sort((a, b) => {
      if (hasImage(a) === hasImage(b)) {
        return 0;
      }
      return hasImage(a) ? -1 : 1;
    });
    return {
      items: sortedData,
    };
  } catch (e) {
    console.error(`[fetchPlantsData] Error fetching ${type} data:`, e);
    return null;
  }
};

export const fetchAnimalsData = async (projectName: string) => {
  // For DID-based projects (ATproto), return empty data
  if (projectName.startsWith('did:plc:')) {
    console.log(`[fetchAnimalsData] Returning empty data for DID project: ${projectName}`);
    return [];
  }

  const kebabCasedProjectName = toKebabCase(projectName);
  try {
    const endpoint = `${process.env.NEXT_PUBLIC_AWS_STORAGE}/predictions/${kebabCasedProjectName}.csv`;
    const data = await d3.csv(endpoint);
    const animalsData = data as unknown as Array<BiodiversityAnimal>;
    return animalsData;
  } catch (e) {
    console.error(`[fetchAnimalsData] Error fetching animals data:`, e);
    return null;
  }
};
