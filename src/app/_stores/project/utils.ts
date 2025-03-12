import {
  Project,
  ProjectDetailsAPIResponse,
  ProjectPolygonAPIResponse,
} from "./types";

export const fetchProjectDetails = async (projectId: string) => {
  const endpoint = `${process.env.NEXT_PUBLIC_GAINFOREST_ENDPOINT}/api/graphql`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
            query {
              project(id:"${projectId}") {
                id
                name
                country
                dataDownloadUrl
                dataDownloadInfo
                description
                longDescription
                stripeUrl
                discordId
                lat
                lon
                area
                objective
                assets {
                  id
                  name
                  classification
                  awsCID
                  shapefile {
                    default
                    isReference
                    shortName
                  }
                }
                communityMembers {
                  id
                  firstName
                  lastName
                  priority
                  role
                  bio
                  Wallet {
                    CeloAccounts
                    SOLAccounts
                  }
                  fundsReceived
                  profileUrl
                }
                Wallet {
                  CeloAccounts
                  SOLAccounts
                }
              }
            }
          `,
    }),
  });
  const responseData: ProjectDetailsAPIResponse = await response.json();
  if ("project" in responseData.data && responseData.data.project) {
    const project = responseData.data.project;
    return project;
  } else {
    return null;
  }
};

export const fetchPolygonByCID = async (cid: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_AWS_STORAGE}/${cid}`);
  const data: ProjectPolygonAPIResponse = await response.json();
  return data;
};

// export const fetchPolygonFromProject = async (project: Project) => {
//   const shapeFiles = project.assets.filter(
//     (asset) => asset.classification === "Shapefiles"
//   );
//   const defaultShapeFiles = shapeFiles.filter(
//     (shapeFile) => shapeFile.shapefile?.default === true
//   );
//   const defaultShapeFile =
//     defaultShapeFiles.length > 0 ? defaultShapeFiles[0] : null;
//   const projectPolygonCID = defaultShapeFile?.awsCID;
//   if (!projectPolygonCID) {
//     return null;
//   }

//   const projectPolygon = await fetchPolygonByCID(projectPolygonCID);
//   return projectPolygon;
// };

export const getProjectSplashImageURLFromProject = (project: Project) => {
  const splashImage = project.assets.find(
    (asset) => asset.classification === "Project Splash"
  );
  if (splashImage?.awsCID) {
    return `${process.env.NEXT_PUBLIC_AWS_STORAGE}/${splashImage?.awsCID}`;
  } else {
    return null;
  }
};

export const fetchProjectNumbers = async (projectId: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AWS_STORAGE}/summary${projectId}.json`
    );
    if (!response.ok) throw new Error("Failed to fetch project numbers");
    return await response.json();
  } catch {
    return null;
  }
};
