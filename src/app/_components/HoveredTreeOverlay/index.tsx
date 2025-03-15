"use client";
import UIBase from "@/components/ui/ui-base";
import { motion } from "framer-motion";
import React from "react";
import useHoveredMapDataStore from "@/app/_stores/hovered-map-data";
import Image from "next/image";
import { Leaf, MoveHorizontal, MoveVertical, X } from "lucide-react";
import useAppViewsStore from "@/app/_stores/app-views";
const HoveredTreeOverlay = () => {
  const hoveredTree = useHoveredMapDataStore((state) => state.treesInformation);
  const setAppActiveTab = useAppViewsStore((state) => state.setAppActiveTab);

  const handleClose = () => {
    setAppActiveTab(undefined);
  };

  if (!hoveredTree) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed top-16 left-2 w-[25%] max-w-[280px] min-w-[180px]"
    >
      <UIBase innerClassName="p-0 overflow-hidden">
        <Image
          src={hoveredTree.treePhotos[0]}
          width={400}
          height={400}
          alt="Hovered Tree"
          className="w-full h-auto object-cover object-center [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]"
        />
        <div className="px-4 pb-2 flex flex-col gap-2 -mt-12">
          <div className="flex flex-col gap-1 items-start">
            <span className="bg-muted/70 backdrop-blur-lg text-muted-foreground text-sm px-3 py-1 rounded-full flex items-center gap-2">
              <Leaf size={16} />
              <span>Species</span>
            </span>
            <h1 className="text-xl font-bold">{hoveredTree.treeName}</h1>
          </div>
          <div className="flex items-center justify-stretch gap-2">
            <div className="flex-1 flex flex-col bg-muted rounded-xl p-2 gap-1">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <MoveVertical size={12} />
                Height
              </span>
              <span className="font-bold text-lg">
                {hoveredTree.treeHeight}
              </span>
            </div>
            <div className="flex-1 flex flex-col bg-muted rounded-xl p-2 gap-1">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <MoveHorizontal size={12} />
                Width
              </span>
              <span className="font-bold text-lg">{hoveredTree.treeDBH}</span>
            </div>
          </div>
          <span className="w-full text-center text-balance text-muted-foreground text-sm">
            <span>Measured:</span> <span>{hoveredTree.dateOfMeasurement}</span>
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <button
            onClick={handleClose}
            className="rounded-full p-2 flex items-center justify-center bg-neutral-800/70 backdrop-blur-lg text-white shadow-sm"
          >
            <X size={16} />
          </button>
        </div>
      </UIBase>
    </motion.div>
  );
};

export default HoveredTreeOverlay;
