import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import React from "react";
import useLayersOverlayStore from "./store";

const LandcoverControls = () => {
  const thisLayerView = useLayersOverlayStore(
    (state) => state.staticLayersVisibility.landcover
  );
  const setStaticLayerVisibility = useLayersOverlayStore(
    (actions) => actions.setStaticLayerVisibility
  );
  
  const handleToggle = (value: boolean) => {
    setStaticLayerVisibility("landcover", value);
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm text-muted-foreground font-semibold mb-1">
        Land Cover
      </h3>
      <div className="text-sm flex flex-col divide-y bg-neutral-50 dark:bg-neutral-950 border border-border rounded-xl">
        <div className="flex items-center justify-between p-4">
          <Label htmlFor="landcover">Global Land Cover (ESA 2021)</Label>
          <Switch
            id="landcover"
            checked={thisLayerView}
            onCheckedChange={handleToggle}
          />
        </div>
      </div>
    </div>
  );
};

export default LandcoverControls;
