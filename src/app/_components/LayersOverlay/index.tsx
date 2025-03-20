import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import useBlurAnimate from "../hooks/useBlurAnimate";
import HistoricalSatelliteControls from "./HistoricalSatelliteControls";
import useLayersOverlayStore from "./store";
import useProjectOverlayStore from "../ProjectOverlay/store";
import { toKebabCase } from "@/lib/utils";
const LayersOverlay = () => {
  const { animate, onAnimationComplete } = useBlurAnimate(
    { opacity: 1, scale: 1, filter: "blur(0px)" },
    { opacity: 1, scale: 1, filter: "unset" }
  );
  const projectData = useProjectOverlayStore((state) => state.projectData);
  const categorizedDynamicLayers = useLayersOverlayStore(
    (state) => state.categorizedDynamicLayers
  );
  const setCategorizedLayers = useLayersOverlayStore(
    (actions) => actions.setCategorizedLayers
  );
  const setDynamicLayerVisibility = useLayersOverlayStore(
    (actions) => actions.setDynamicLayerVisibility
  );

  useEffect(() => {
    setCategorizedLayers(projectData);
  }, [projectData]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      animate={animate}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      onAnimationComplete={onAnimationComplete}
      className="p-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <Layers size={20} />
        <span className="text-xl font-bold">Explore Layers</span>
      </div>

      {/* Monthly Satellite Layer */}
      <HistoricalSatelliteControls />

      {categorizedDynamicLayers.map((layerCategory) => {
        const key = Object.keys(layerCategory)[0];
        const layers = layerCategory[key];
        return (
          <div className="mb-6" key={key}>
            <h3 className="text-sm text-muted-foreground font-semibold mb-1 capitalize">
              {key}
            </h3>
            <div className="text-sm flex flex-col divide-y bg-neutral-50 dark:bg-neutral-950 border border-border rounded-xl">
              {layers.map((layer) => {
                const id = toKebabCase(layer.name);
                return (
                  <div
                    className="flex items-center justify-between p-4"
                    key={id}
                  >
                    <Label htmlFor={id}>{layer.name}</Label>
                    <Switch
                      id={id}
                      checked={layer.visible}
                      onCheckedChange={(value) => {
                        setDynamicLayerVisibility(layer.name, value);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
};

export default LayersOverlay;
