"use client";
import React from "react";
import { motion } from "framer-motion";
import { Maximize2, Minimize2 } from "lucide-react";
import Splash from "./Splash";
import Loading from "./loading";
import Error from "./error";
import Header from "./Header";
import TabMapper from "./TabMapper";
import useProjectOverlayStore from "./store";
import { getProjectSplashImageURLFromProject } from "./store/utils";
import useBlurAnimate from "../hooks/useBlurAnimate";

const ProjectOverlay = () => {
  const projectDataStatus = useProjectOverlayStore(
    (state) => state.projectDataStatus
  );
  const projectData = useProjectOverlayStore((state) => state.projectData);
  const isMaximized = useProjectOverlayStore((state) => state.isMaximized);
  const setIsMaximized = useProjectOverlayStore(
    (state) => state.setIsMaximized
  );
  const { animate, onAnimationComplete } = useBlurAnimate(
    { opacity: 1, scale: 1, filter: "blur(0px)" },
    { opacity: 1, scale: 1, filter: "unset" }
  );

  const splashImageURL = projectData
    ? getProjectSplashImageURLFromProject(projectData)
    : null;

  return (
    <motion.div
      id="project-overlay"
      initial={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      animate={animate}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      onAnimationComplete={onAnimationComplete}
      className="relative h-full w-full"
    >
      <div className="absolute inset-0 scrollable overflow-y-auto overflow-x-hidden scrollbar-variant-1 flex flex-col">
        {projectDataStatus === "loading" ? (
          <Loading />
        ) : projectDataStatus === "error" || projectData === null ? (
          <Error />
        ) : (
          <div className="w-full relative flex flex-col flex-1">
            <Splash imageURL={splashImageURL} projectDetails={projectData} />
            <Header projectData={projectData} />
            <div className="flex flex-col gap-2 p-4 -translate-y-20 flex-1 -mb-20">
              <TabMapper projectData={projectData} />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 absolute top-2 right-2 z-10">
        <button
          onClick={() => setIsMaximized(!isMaximized)}
          className="rounded-full p-2 flex items-center justify-center bg-neutral-800/70 backdrop-blur-lg text-white shadow-sm"
        >
          {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </motion.div>
  );
};

export default ProjectOverlay;
