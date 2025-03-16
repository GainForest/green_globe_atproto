import { Project } from "../../ProjectOverlay/store/types";
import { LayersAPIResponse, Layer } from "./types";

const cleanEndpoint = (endpoint: string) => {
  return endpoint.replace(
    "${process.env.AWS_STORAGE}",
    process.env.NEXT_PUBLIC_AWS_STORAGE ?? ""
  );
};

export const fetchLayers = async (
  projectData: Project | null
): Promise<Layer[]> => {
  let layersData: Layer[] = [];

  try {
    const globalLayersResponse = await fetch(
      `${process.env.NEXT_PUBLIC_AWS_STORAGE}/layers/global/layerData.json`
    );
    const globalLayers: LayersAPIResponse = await globalLayersResponse.json();
    layersData = [...globalLayers.layers];
  } catch (error) {
    console.error("Error fetching global layers", error);
    return [];
  }

  if (!projectData) {
  }

  // TODO: Add project layers, but couldn't find any project with layers.

  //   if (projectData) {
  //     const kebabCasedProjectName = toKebabCase(projectData.name);
  //     const projectLayersResponse = await fetch(
  //       `${process.env.NEXT_PUBLIC_AWS_STORAGE}/layers/${kebabCasedProjectName}/layerData.json`
  //     );
  //     const projectLayers = await projectLayersResponse.json();
  //     console.log("projectLayers", projectLayers);
  //     // const filteredProjectLayers = projectLayers.layers.filter(
  //     //   (item) =>
  //     //     !item.name.includes('DNA') && !item.name.includes('Raft Deployment')
  //     // )
  //    // layersData = [...layersData, ...filteredProjectLayers];
  //   }

  layersData = layersData.map((layer) => ({
    ...layer,
    endpoint: cleanEndpoint(layer.endpoint),
  }));

  return layersData;
};
