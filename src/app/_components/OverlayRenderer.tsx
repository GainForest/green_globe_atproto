"use client";

import useAppViewsStore from "@/app/_stores/app-views";
import ProjectOverlay from "./ProjectOverlay";
import LayersOverlay from "./LayersOverlay";
import { AnimatePresence } from "framer-motion";
import HoveredTreeOverlay from "./HoveredTreeOverlay";

const OverlayRenderer = () => {
  const appActiveTab = useAppViewsStore((state) => state.appActiveTab);

  let overlay = null;
  if (appActiveTab === "project") overlay = <ProjectOverlay />;
  if (appActiveTab === "layers") overlay = <LayersOverlay />;

  return (
    <AnimatePresence>
      {overlay}
      {<HoveredTreeOverlay />}
    </AnimatePresence>
  );
};

export default OverlayRenderer;
