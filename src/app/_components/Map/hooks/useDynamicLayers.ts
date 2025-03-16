import useLayersOverlayStore from "../../LayersOverlay/store";
import { DynamicLayer } from "../../LayersOverlay/store/types";
import useMapStore from "../store";
import { useEffect, useMemo } from "react";
import addNamedSource, {
  removeNamedSource,
} from "../sources-and-layers/dynamic-layers";

const useDynamicLayers = () => {
  const mapRef = useMapStore((state) => state.mapRef);
  const categorizedDynamicLayers = useLayersOverlayStore(
    (state) => state.categorizedDynamicLayers
  );
  const flatMapLayers = useMemo(() => {
    const arr: DynamicLayer[] = [];
    categorizedDynamicLayers.forEach((category) => {
      const layers = category[Object.keys(category)[0]];
      layers.forEach((layer) => {
        arr.push(layer);
      });
    });
    return arr;
  }, [categorizedDynamicLayers]);

  useEffect(() => {
    const map = mapRef?.current;
    if (!map) return;

    flatMapLayers.forEach((layer) => {
      if (layer.visible) {
        addNamedSource(map, layer);
      } else {
        removeNamedSource(map, layer);
      }
    });
  }, [mapRef, flatMapLayers]);
};

export default useDynamicLayers;
