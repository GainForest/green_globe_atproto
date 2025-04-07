"use client";

import UIBase from "@/components/ui/ui-base";
import React, { useRef } from "react";
import AppTabs from "./AppTabs";
import OverlayRenderer from "../OverlayRenderer";
import Header from "./Header";
import { ChevronLeft, Maximize2, Minimize2 } from "lucide-react";
import { motion } from "framer-motion";
import useSidebarStore from "./store";
import { cn } from "@/lib/utils";
import useProjectOverlayStore from "../ProjectOverlay/store";
import useAppTabsStore from "./AppTabs/store";
import { Button } from "@/components/ui/button";
const SIDEBAR_WIDTH = 500;

const SmallerDeviceSidebar = () => {
  const overlayTouchBar = useRef<HTMLDivElement>(null);
  const [totalDisplacement, setTotalDisplacement] = React.useState(0);
  const [startY, setStartY] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isMaximized, setIsMaximized] = React.useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    console.log("Touch Start:", {
      clientY: e.touches[0].clientY,
      pageY: e.touches[0].pageY,
      screenY: e.touches[0].screenY,
      target: e.target,
    });
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    const newDisplacement = Math.min(
      0,
      Math.max(-window.innerHeight + 100, totalDisplacement + deltaY)
    );

    console.log("Touch Move:", {
      currentY,
      startY,
      deltaY,
      currentDisplacement: totalDisplacement,
      newDisplacement,
      isDragging,
    });

    setTotalDisplacement(newDisplacement);
    setStartY(currentY);
  };

  const handleTouchEnd = () => {
    console.log("Touch End:", {
      finalDisplacement: totalDisplacement,
      isDragging,
    });
    if (totalDisplacement <= -window.innerHeight + 100) {
      setIsMaximized(true);
    } else {
      setIsMaximized(false);
    }
    setIsDragging(false);
  };

  return (
    <>
      {!isMaximized && (
        <motion.div className="fixed -top-1 -left-1 -right-1 z-10">
          <UIBase innerClassName="p-3 rounded-none" className="rounded-none">
            <Header />
          </UIBase>
        </motion.div>
      )}
      <div
        className="fixed left-0 right-0 z-10 flex flex-col items-center"
        style={{
          top: isMaximized
            ? "0"
            : `calc(100% - 4.2rem + ${totalDisplacement}px)`,
        }}
      >
        <UIBase
          className={cn(
            "w-full max-w-xl",
            isMaximized ? "border-none max-w-full" : ""
          )}
          innerClassName={cn(
            "h-screen overflow-y-auto p-0",
            isMaximized ? "border-none" : ""
          )}
        >
          {isMaximized && (
            <div className="p-2 pb-0 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsMaximized(false);
                  setTotalDisplacement(0);
                }}
              >
                <ChevronLeft size={16} />
              </Button>
              <Header showBrandName={false} />
            </div>
          )}
          <div
            className="w-full flex flex-col border-b border-b-border p-2"
            ref={overlayTouchBar}
            {...(!isMaximized && {
              onTouchStart: handleTouchStart,
              onTouchMove: handleTouchMove,
              onTouchEnd: handleTouchEnd,
            })}
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              touchAction: "none",
            }}
          >
            {!isMaximized && (
              <div className="w-full flex items-center justify-center mt-1">
                <button className="h-auto w-full p-1 flex items-center justify-center -mt-1">
                  <div className="h-1 w-8 rounded-full bg-foreground/20" />
                </button>
              </div>
            )}
            <AppTabs />
          </div>
          <div className="w-full flex-1 h-full">
            <OverlayRenderer />
          </div>
        </UIBase>
      </div>
    </>
  );
};

const Sidebar = () => {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const setIsOpen = useSidebarStore((state) => state.setIsOpen);

  const projectData = useProjectOverlayStore((state) => state.projectData);
  const isMaximized = useProjectOverlayStore((state) => state.isMaximized);
  const setIsMaximized = useProjectOverlayStore(
    (state) => state.setIsMaximized
  );

  const activeAppTab = useAppTabsStore((state) => state.activeTab);
  const computedSidebarWidth =
    isMaximized && activeAppTab === "project" ? "50vw" : `${SIDEBAR_WIDTH}px`;

  const isSmallerDevice = false;

  if (isSmallerDevice) {
    return <SmallerDeviceSidebar />;
  }

  return (
    <motion.div
      className="fixed top-2 left-2 bottom-2 flex items-start gap-2"
      initial={{ opacity: 0, x: `-${computedSidebarWidth}` }}
      animate={{ opacity: 1, x: isOpen ? 0 : `-${computedSidebarWidth}` }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="h-full p-0"
        animate={{
          width: computedSidebarWidth,
        }}
      >
        <UIBase
          className="w-full h-full p-0"
          innerClassName="flex flex-col w-full h-full p-0 overflow-scroll"
        >
          <div className="sticky top-0 flex flex-col gap-4 p-4 border-b border-b-border bg-background/50 backdrop-blur-lg shadow-lg z-10">
            <Header />
            <AppTabs />
          </div>
          <div className="w-full flex-1">
            <OverlayRenderer />
          </div>
        </UIBase>
      </motion.div>
      <UIBase innerClassName="p-0.5 flex flex-col">
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          <ChevronLeft
            size={16}
            className={cn(
              "transition-all duration-300",
              isOpen ? "" : "rotate-180"
            )}
          />
        </Button>
        {isOpen && activeAppTab === "project" && projectData && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        )}
      </UIBase>
    </motion.div>
  );
};

export default Sidebar;
