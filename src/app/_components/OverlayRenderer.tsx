"use client";

import ProjectOverlay from "./ProjectOverlay";
import LayersOverlay from "./LayersOverlay";
import { AnimatePresence } from "framer-motion";
import HoveredTreeOverlay from "./HoveredTreeOverlay";
import useAppTabsStore from "@/app/_components/Header/AppTabs/store";
import SearchOverlay from "./SearchOverlay";
const OverlayRenderer = () => {
  const appActiveTab = useAppTabsStore((state) => state.activeTab);

  let overlay = null;
  if (appActiveTab === "search") overlay = <SearchOverlay />;
  if (appActiveTab === "project") overlay = <ProjectOverlay />;
  if (appActiveTab === "layers") overlay = <LayersOverlay />;
  if (appActiveTab === "hovered-tree") overlay = <HoveredTreeOverlay />;

  return <AnimatePresence>{overlay}</AnimatePresence>;
};

export default OverlayRenderer;
