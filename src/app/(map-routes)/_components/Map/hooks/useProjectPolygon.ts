import bbox from "@turf/bbox";
import { GeoJSONSource } from "mapbox-gl";
import { useEffect } from "react";
import useMapStore from "../store";

/**
 * When the active project polygon changes, fit the map to the polygon and update the highlighted site source
 * @param mapRef - The ref to the map
 */
const useProjectPolygon = () => {
  const currentView = useMapStore((state) => state.currentView);
  const projectPolygon = useMapStore((state) => state.projectPolygon);
  const mapRef = useMapStore((state) => state.mapRef);
  useEffect(() => {
    if (currentView !== "project") return;
    const map = mapRef?.current;
    if (!map || !projectPolygon) return;

    // Calculate the bounding box and ensure it's 2D
    const boundingBox = bbox(projectPolygon).slice(0, 4) as [
      number,
      number,
      number,
      number
    ];
    map.fitBounds(boundingBox, {
      padding: { top: 40, bottom: 40, left: 40, right: 40 },
    });
    (map.getSource("highlightedSite") as GeoJSONSource | undefined)?.setData(
      projectPolygon
    );
  }, [mapRef, currentView, projectPolygon]);
};

export default useProjectPolygon;
