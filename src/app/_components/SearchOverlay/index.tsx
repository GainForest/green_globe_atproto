import React, { useEffect, useMemo } from "react";
import useBlurAnimate from "../hooks/useBlurAnimate";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import useSearchOverlayStore from "./store";
import { fetchProjectSites } from "../Map/utils";
import { countryToEmoji } from "@/lib/country-emojis";
import { Button } from "@/components/ui/button";
import useProjectOverlayStore from "../ProjectOverlay/store";
import useMapStore from "../Map/store";
const SearchOverlay = () => {
  const { animate, onAnimationComplete } = useBlurAnimate(
    { opacity: 1, scale: 1, filter: "blur(0px)" },
    { opacity: 1, scale: 1, filter: "unset" }
  );

  const setCurrentMapView = useMapStore((state) => state.setCurrentView);

  const projectId = useProjectOverlayStore((state) => state.projectId);
  const setProjectId = useProjectOverlayStore((state) => state.setProjectId);

  const searchQuery = useSearchOverlayStore((state) => state.searchQuery);
  const setSearchQuery = useSearchOverlayStore((state) => state.setSearchQuery);

  const allProjects = useSearchOverlayStore((state) => state.allProjects);
  const setAllProjects = useSearchOverlayStore((state) => state.setAllProjects);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      const lcSearchQuery = searchQuery.toLowerCase();
      const properties = project.properties;
      const countryDetails = Object.keys(countryToEmoji).includes(
        project.properties.country
      )
        ? countryToEmoji[
            project.properties.country as keyof typeof countryToEmoji
          ]
        : null;
      const countryName = countryDetails?.name;
      return (
        properties.name.toLowerCase().includes(lcSearchQuery) ||
        countryName?.toLowerCase().includes(lcSearchQuery)
      );
    });
  }, [allProjects, searchQuery]);

  useEffect(() => {
    fetchProjectSites().then((projectSites) => {
      const features = projectSites.features;
      setAllProjects(features);
    });
  }, []);

  const handleProjectClick = (projectId: string) => {
    setProjectId(projectId);
    setCurrentMapView("project");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      animate={animate}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      onAnimationComplete={onAnimationComplete}
      className=""
    >
      <div className="scrollable overflow-y-auto overflow-x-hidden scrollbar-variant-1 p-4">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects"
          className="bg-background rounded-xl bg-neutral-200 dark:bg-neutral-800 h-10"
        />
        <div className="flex flex-col divide-y rounded-xl border border-border mt-4 overflow-hidden">
          {filteredProjects.map((project) => {
            const countryDetails = Object.keys(countryToEmoji).includes(
              project.properties.country
            )
              ? countryToEmoji[
                  project.properties.country as keyof typeof countryToEmoji
                ]
              : null;
            return (
              <Button
                variant={
                  projectId === project.properties.projectId
                    ? "secondary"
                    : "outline"
                }
                //   className="rounded-none"
                className="h-auto rounded-none p-3 text-left flex flex-col gap-2 items-start whitespace-normal"
                key={project.properties.projectId}
                onClick={() => handleProjectClick(project.properties.projectId)}
              >
                <span className="font-bold">{project.properties.name}</span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  <span className="px-2 py-1 bg-foreground/10 backdrop-blur-lg rounded-full text-sm">
                    {countryDetails?.emoji}
                    &nbsp;&nbsp;
                    {countryDetails?.name}
                  </span>
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchOverlay;
