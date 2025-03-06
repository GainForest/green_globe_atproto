"use client";
import { useProjectStore } from "@/app/stores/project";
import UIBase from "@/components/ui/ui-base";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, X } from "lucide-react";
import { getProjectSplashImageURLFromProject } from "@/app/stores/project/utils";
import Splash from "./Splash";
import Loading from "./loading";
import Error from "./error";
import Header from "./Header";
import TabMapper from "./TabMapper";

const ProjectOverlay = () => {
  const activeProjectId = useProjectStore((state) => state.activeProjectId);
  const activeProjectDetails = useProjectStore(
    (state) => state.activeProjectDetails
  );
  const setActiveProjectId = useProjectStore(
    (action) => action.setActiveProjectId
  );
  if (!activeProjectId || activeProjectDetails.status === "idle") return null;

  const splashImageURL = activeProjectDetails.data
    ? getProjectSplashImageURLFromProject(activeProjectDetails.data)
    : null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed top-16 bottom-2 left-2 w-[25%] max-w-[400px] min-w-[280px]"
      >
        <UIBase
          className="h-full"
          innerClassName="h-full relative p-0 overflow-hidden"
          id="project-overlay"
        >
          <div className="absolute inset-0 scrollable overflow-y-auto overflow-x-hidden scrollbar-variant-1 flex flex-col">
            {activeProjectDetails.status === "loading" ? (
              <Loading />
            ) : activeProjectDetails.status === "error" ||
              activeProjectDetails.data === null ? (
              <Error />
            ) : (
              <div className="w-full relative flex flex-col flex-1">
                <Splash
                  imageURL={splashImageURL}
                  projectDetails={activeProjectDetails.data}
                />
                <Header projectDetails={activeProjectDetails.data} />
                <div className="flex flex-col gap-2 p-4 -translate-y-20 flex-1 -mb-20">
                  <TabMapper projectDetails={activeProjectDetails.data} />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 absolute top-2 right-2 z-10">
            <button
              onClick={() => setActiveProjectId(undefined)}
              className="rounded-full p-2 flex items-center justify-center bg-neutral-800/70 backdrop-blur-lg text-white shadow-sm"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={() => setActiveProjectId(undefined)}
              className="rounded-full p-2 flex items-center justify-center bg-neutral-800/70 backdrop-blur-lg text-white shadow-sm"
            >
              <X size={16} />
            </button>
          </div>
        </UIBase>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectOverlay;
