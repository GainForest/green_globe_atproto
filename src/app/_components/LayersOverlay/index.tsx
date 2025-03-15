import React, { useState } from "react";
import { motion } from "framer-motion";
import UIBase from "@/components/ui/ui-base";
import { Layers, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import useAppTabsStore from "../Header/AppTabs/store";

const LayersOverlay = () => {
  // State for layer toggles
  const [historicalSatellite, setHistoricalSatellite] = useState(false);
  const [amazonMiningWatch, setAmazonMiningWatch] = useState(false);
  const [detectedAirstrips, setDetectedAirstrips] = useState(false);
  const [indigenousLands, setIndigenousLands] = useState(false);

  const setAppActiveTab = useAppTabsStore((state) => state.setActiveTab);

  const handleClose = () => {
    setAppActiveTab(undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed top-16 bottom-2 left-2 w-[25%] max-w-[400px] min-w-[280px]"
    >
      <UIBase innerClassName="p-4">
        <div className="flex items-center gap-3 mb-6">
          <Layers size={20} />
          <span className="text-xl font-bold">Explore Layers</span>
        </div>

        {/* Monthly Satellite Layer */}
        <div className="mb-6">
          <h3 className="text-sm text-muted-foreground font-semibold mb-1">
            Monthly Satellite Layer
          </h3>
          <div className="flex flex-col divide-y bg-neutral-50 dark:bg-neutral-950 border border-border rounded-xl">
            <div className="flex items-center justify-between p-4">
              <Label htmlFor="historical-satellite">Historical Satellite</Label>
              <Switch
                id="historical-satellite"
                checked={historicalSatellite}
                onCheckedChange={setHistoricalSatellite}
              />
            </div>
          </div>
        </div>

        {/* Deforestation Related Data Layers */}
        <div className="mb-6">
          <h3 className="text-sm text-muted-foreground font-semibold mb-1">
            Deforestation Related Data Layers
          </h3>
          <div className="flex flex-col divide-y bg-neutral-50 dark:bg-neutral-950 border border-border rounded-xl">
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
        </div>

        {/* Land Cover Related Data Layers */}
        <div className="mb-6">
          <h3 className="text-sm text-muted-foreground font-semibold mb-1">
            Land Cover Related Data Layers
          </h3>
          <div className="flex flex-col divide-y bg-neutral-50 dark:bg-neutral-950 border border-border rounded-xl">
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

export default LayersOverlay;
