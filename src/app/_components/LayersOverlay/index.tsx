import React from "react";
import { motion } from "framer-motion";
import UIBase from "@/components/ui/ui-base";

const LayersOverlay = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed top-16 bottom-2 left-2 w-[25%] max-w-[400px] min-w-[280px]"
    >
      <UIBase className="h-full">
        <div className="h-full relative p-0 overflow-hidden">
          <div className="h-full">Layers</div>
        </div>
      </UIBase>
    </motion.div>
  );
};
export default LayersOverlay;
