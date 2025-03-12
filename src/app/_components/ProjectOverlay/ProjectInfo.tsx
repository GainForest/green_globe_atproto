"use client";
import React, { useEffect } from "react";
import { Project, Shapefile } from "@/app/_stores/project/types";
import { Combobox } from "@/components/ui/combobox";
import { useProjectStore } from "@/app/_stores/project";

type SiteAsset = {
  id: string;
  name: string;
  shapefile: Shapefile;
  awsCID: string;
  classification: "Shapefiles";
};

const ProjectSitesSection = ({
  projectDetails,
}: {
  projectDetails: Project;
}) => {
  const setActiveProjectPolygonByCID = useProjectStore(
    (actions) => actions.setActiveProjectPolygonByCID
  );

  const projectSites = projectDetails.assets.filter((asset) => {
    if (asset.classification !== "Shapefiles") return false;
    if (asset.shapefile === null) return false;
    const shapefile = asset.shapefile;
    return Boolean(shapefile.shortName && !shapefile.isReference);
  }) as SiteAsset[];

  const projectSitesOptions = projectSites.map((site) => ({
    value: site.awsCID,
    label: site.shapefile.shortName,
  }));

  const [selectedSite, setSelectedSite] = React.useState<string | undefined>(
    undefined
  );

  const handleProjectSiteChange = (siteId: string) => {
    setSelectedSite(siteId);
    setActiveProjectPolygonByCID(siteId);
  };

  useEffect(() => {
    if (projectSitesOptions.length === 0) return;
    handleProjectSiteChange(projectSitesOptions[0].value);
  }, [handleProjectSiteChange, projectSitesOptions]);

  if (projectSitesOptions.length === 0) return null;

  return (
    <section className="flex items-center gap-2">
      <span className="text-muted-foreground font-bold">
        Project Site{projectSitesOptions.length > 1 ? "s" : ""}
      </span>
      {projectSitesOptions.length > 1 ? (
        <Combobox
          options={projectSitesOptions}
          value={selectedSite}
          onChange={handleProjectSiteChange}
          className="flex-1"
          searchIn="label"
        />
      ) : (
        <span className="text-muted-foreground flex-1 bg-accent px-2 py-1 rounded-md">
          {projectSitesOptions[0].label}
        </span>
      )}
    </section>
  );
};

const ProjectObjectivesSection = ({
  projectDetails,
}: {
  projectDetails: Project;
}) => {
  const objectives = projectDetails.objective.split(",");
  return (
    <section className="flex flex-col gap-0.5">
      <span className="font-bold">Objective</span>
      <div className="flex flex-wrap gap-2 mt-1">
        {objectives.map((objective) => (
          <span
            key={objective}
            className="px-2 py-1 bg-background/50 backdrop-blur-lg rounded-full text-sm"
          >
            {objective}
          </span>
        ))}
      </div>
    </section>
  );
};

const ProjectInfo = ({ projectDetails }: { projectDetails: Project }) => {
  return (
    <div className="flex flex-col gap-4">
      <ProjectSitesSection projectDetails={projectDetails} />
      <section className="flex flex-col gap-0.5">
        <span className="font-bold">Description</span>
        <p className="leading-snug">{projectDetails.longDescription}</p>
      </section>
      <ProjectObjectivesSection projectDetails={projectDetails} />
    </div>
  );
};

export default ProjectInfo;
