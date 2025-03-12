"use client";
import React from "react";
import useAppViewsStore from "@/app/_stores/app-views";
import { Project } from "@/app/_stores/project/types";
import ProjectInfo from "./ProjectInfo";
import AIAssistant from "./AIAssistant";

const TabMapper = ({ projectDetails }: { projectDetails: Project }) => {
  const projectOverlayTab = useAppViewsStore(
    (state) => state.projectOverlayTab
  );

  switch (projectOverlayTab) {
    case "info":
      return <ProjectInfo projectDetails={projectDetails} />;
    case "ask-ai":
      return <AIAssistant />;
    default:
      return null;
  }
};

export default TabMapper;
