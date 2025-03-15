import { useCallback, useRef } from "react";
import { MapMouseEvent } from "mapbox-gl";

import { getTreeInformation } from "../utils";
import useHoveredTreeOverlayStore, {
  HoveredTreeOverlayState,
} from "../../HoveredTreeOverlay/store";
import { NormalizedTreeFeature } from "../store/types";

export function useHoveredTreeInfo() {
  // Get the setter from the store
  const setTreesInformation = useHoveredTreeOverlayStore(
    (actions) => actions.setTreeInformation
  );

  // Debounce timeout ref
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create a ref to track the currently hovered tree ID
  const hoveredTreeIdRef = useRef<number | null>(null);

  // Debounced version of setTreesInformation
  const debouncedSetTreesInformation = useCallback(
    (treeInfo: HoveredTreeOverlayState["treeInformation"]) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        setTreesInformation(treeInfo);
      }, 150);
    },
    [setTreesInformation]
  );

  // Handler for mouse move events
  const handleMouseMoveUnclusteredTrees = useCallback(
    (e: MapMouseEvent, map: mapboxgl.Map, activeProjectId: string) => {
      if (!e.features || e.features.length <= 0) return;

      const treeInformation = getTreeInformation(e, activeProjectId);
      debouncedSetTreesInformation(treeInformation);

      if (hoveredTreeIdRef.current !== null) {
        map.setFeatureState(
          { source: "trees", id: hoveredTreeIdRef.current },
          { hover: false }
        );
      }

      const hoveredTreeFeature = e.features.find((feature) => {
        if (!feature.properties) return null;
        return (
          "type" in feature.properties &&
          feature.properties.type === "measured-tree"
        );
      }) as NormalizedTreeFeature | undefined;

      if (!hoveredTreeFeature) return;
      hoveredTreeIdRef.current = hoveredTreeFeature.id;
      map.setFeatureState(
        { source: "trees", id: hoveredTreeFeature.id },
        { hover: true }
      );
    },
    [debouncedSetTreesInformation]
  );

  // Cleanup function
  const cleanup = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Reset the hovered tree ID ref
    hoveredTreeIdRef.current = null;
  }, []);

  return {
    handleMouseMoveUnclusteredTrees,
    cleanup,
  };
}
