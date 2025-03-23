import { create } from "zustand";
import { fetchMeasuredTreesShapefile } from "./utils";
import { MeasuredTreesGeoJSON, ProjectPolygonAPIResponse } from "./types";
import { Map } from "mapbox-gl";

export type MapState = {
  currentView: "project";
  projectTrees: MeasuredTreesGeoJSON | null;
  mapBounds: [number, number, number, number] | null;
  mapRef: React.RefObject<Map | null> | null;
  mapLoaded: boolean;
  highlightedPolygon: ProjectPolygonAPIResponse | null;
};

export type MapActions = {
  setMapBounds: (bounds: [number, number, number, number] | null) => void;
  setProjectTrees: (projectName: string | null) => void;
  setCurrentView: (currentView: "project") => void;
  setMapRef: (mapRef: React.RefObject<Map | null>) => void;
  setMapLoaded: (mapLoaded: boolean) => void;
  setHighlightedPolygon: (polygon: ProjectPolygonAPIResponse | null) => void;
};

const initialState: MapState = {
  currentView: "project",
  projectTrees: null,
  highlightedPolygon: null,
  mapBounds: null,
  mapRef: null,
  mapLoaded: false,
};

const useMapStore = create<MapState & MapActions>((set) => {
  return {
    ...initialState,
    setMapBounds: (bounds) => {
      set({ mapBounds: bounds });
    },
    setProjectTrees: async (projectName) => {
      if (!projectName) {
        set({ projectTrees: null });
        return;
      }
      fetchMeasuredTreesShapefile(projectName)
        .then((data) => {
          set({ projectTrees: data });
        })
        .catch((err) => {
          console.error("Error fetching measured trees shapefile", err);
          set({ projectTrees: null });
        });
    },
    setCurrentView: (currentView) => {
      set({ currentView });
    },
    setMapRef: (mapRef) => {
      set({ mapRef });
    },
    setMapLoaded: (mapLoaded) => {
      set({ mapLoaded });
    },
    setHighlightedPolygon: (highlightedPolygon) => {
      set({ highlightedPolygon });
    },
  };
});

export default useMapStore;
