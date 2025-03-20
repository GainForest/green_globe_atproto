import { create } from "zustand";
import { fetchMeasuredTreesShapefile, fetchPolygonByCID } from "./utils";
import { MeasuredTreesGeoJSON } from "./types";
import { Map } from "mapbox-gl";

export type MapState = {
  projectPolygon: GeoJSON.FeatureCollection | null;
  projectTrees: MeasuredTreesGeoJSON | null;
  currentView: "project";
  mapRef: React.RefObject<Map | null> | null;
  mapLoaded: boolean;
};

export type MapActions = {
  setProjectPolygon: (awsCID: string | null) => void;
  setProjectTrees: (projectName: string | null) => void;
  setCurrentView: (currentView: "project") => void;
  setMapRef: (mapRef: React.RefObject<Map | null>) => void;
  setMapLoaded: (mapLoaded: boolean) => void;
};

const initialState: MapState = {
  projectPolygon: null,
  projectTrees: null,
  currentView: "project",
  mapRef: null,
  mapLoaded: false,
};

const useMapStore = create<MapState & MapActions>((set) => {
  return {
    ...initialState,
    setProjectPolygon: async (awsCID) => {
      if (!awsCID) {
        set({ projectPolygon: null });
        return;
      }
      const polygon = await fetchPolygonByCID(awsCID);
      set({ projectPolygon: polygon });
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
  };
});

export default useMapStore;
