import React, { useEffect } from "react";
import { motion } from "framer-motion";
import UIBase from "@/components/ui/ui-base";
import { Layers, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import useAppTabsStore from "../Header/AppTabs/store";
import useBlurAnimate from "../hooks/useBlurAnimate";
import HistoricalSatelliteControls from "./HistoricalSatelliteControls";
import useLayersOverlayStore from "./store";
import useProjectOverlayStore from "../ProjectOverlay/store";

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

  const setAppActiveTab = useAppTabsStore((state) => state.setActiveTab);

  const handleClose = () => {
    setAppActiveTab(undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      animate={animate}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      onAnimationComplete={onAnimationComplete}
      className="fixed top-16 bottom-2 left-2 w-[25%] max-w-[400px] min-w-[280px]"
    >
      <UIBase innerClassName="p-4">
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
                  return (
                    <div
                      className="flex items-center justify-between p-4"
                      key={layer.type}
                    >
                      <Label htmlFor={layer.type}>{layer.name}</Label>
                      <Switch
                        id={layer.type}
                        checked={layer.visible}
                        onCheckedChange={() => {
                          setDynamicLayerVisibility(layer.type, !layer.visible);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Deforestation Related Data Layers */}
        {/* <div className="mb-6">
          <h3 className="text-sm text-muted-foreground font-semibold mb-1">
            Deforestation Related Data Layers
          </h3>
          <div className="text-sm flex flex-col divide-y bg-neutral-50 dark:bg-neutral-950 border border-border rounded-xl">
            <div className="flex items-center justify-between p-4">
              <Label htmlFor="amazon-mining-watch">Amazon Mining Watch</Label>
              <Switch
                id="amazon-mining-watch"
                checked={amazonMiningWatch}
                onCheckedChange={setAmazonMiningWatch}
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <Label htmlFor="detected-airstrips">
                Detected Airstrips in Amazon
              </Label>
              <Switch
                id="detected-airstrips"
                checked={detectedAirstrips}
                onCheckedChange={setDetectedAirstrips}
              />
            </div>
          </div>
        </div> */}

        {/* Land Cover Related Data Layers */}
        {/* <div className="mb-6">
          <h3 className="text-sm text-muted-foreground font-semibold mb-1">
            Land Cover Related Data Layers
          </h3>
          <div className="text-sm flex flex-col divide-y bg-neutral-50 dark:bg-neutral-950 border border-border rounded-xl">
            <div className="flex items-center justify-between p-4">
              <Label htmlFor="indigenous-lands">
                Indigenous Lands in Brazil
              </Label>
              <Switch
                id="indigenous-lands"
                checked={indigenousLands}
                onCheckedChange={setIndigenousLands}
              />
            </div>
          </div>
        </div> */}
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

export default LayersOverlay;
