import { create } from "zustand";
import { useProjectStore } from "./project";

// type MapViewStateCatalog = {
//   project: {
//     type: "project";
//     projectId: string;
//     siteAssetAWSCID: string;
//   };
//   geojson: {
//     type: "geojson";
//     geojson: GeoJSON.FeatureCollection;
//   };
// };

// type MapViewState = MapViewStateCatalog[keyof MapViewStateCatalog];

export type State = {
  mapView: "project" | "geojson" | undefined;
  appActiveTab: "hovered-tree" | "project" | "layers" | "search" | undefined;
  projectOverlayTab:
    | "info"
    | "ask-ai"
    | "biodiversity"
    | "media"
    | "remote-sensing-analysis"
    | "community-donations"
    | "logbook"
    | "edit"
    | undefined;
};

export type Actions = {
  setMapView: (mapView: State["mapView"]) => void;
  setProjectOverlayTab: (projectOverlayTab: State["projectOverlayTab"]) => void;
  setAppActiveTab: (appActiveTab: State["appActiveTab"]) => void;
};

const initialState: State = {
  mapView: undefined,
  appActiveTab: undefined,
  projectOverlayTab: undefined,
};

const useAppViewsStore = create<State & Actions>((set) => {
  return {
    ...initialState,
    setMapView: (mapView) => {
      set({ mapView });
      if (!mapView) {
        useProjectStore.getState().resetState();
      }
    },
    setProjectOverlayTab: (projectOverlayTab: State["projectOverlayTab"]) =>
      set({ projectOverlayTab }),
    setAppActiveTab: (appActiveTab: State["appActiveTab"]) =>
      set({ appActiveTab }),
  };
});

export default useAppViewsStore;
