import { create } from "zustand";
import dayjs from "dayjs";
import { Project } from "../../ProjectOverlay/store/types";
import { fetchLayers } from "./utils";
import { DynamicLayer } from "./types";
import { groupBy } from "@/lib/utils";

export type LayersOverlayState = {
  staticLayersVisibility: {
    historicalSatellite: boolean;
  };
  categorizedDynamicLayers: Record<string, DynamicLayer[]>[];
  historicalSatelliteState: {
    minDate: dayjs.Dayjs;
    maxDate: dayjs.Dayjs;
    previousDate: dayjs.Dayjs | null;
    formattedPreviousDate: string | null;
    currentDate: dayjs.Dayjs;
    formattedCurrentDate: string;
  };
};

export type LayersOverlayActions = {
  setHistoricalSatelliteDate: (date: dayjs.Dayjs) => void;
  setStaticLayerVisibility: (
    layerView: keyof LayersOverlayState["staticLayersVisibility"],
    value: boolean
  ) => void;
  setDynamicLayerVisibility: (layerName: string, value: boolean) => void;
  setCategorizedLayers: (projectData: Project | null) => Promise<void>;
};

const initialState: LayersOverlayState = {
  staticLayersVisibility: {
    historicalSatellite: false,
  },
  categorizedDynamicLayers: [],
  historicalSatelliteState: {
    minDate: dayjs("2020-09-01"),
    maxDate: dayjs().subtract(6, "week").set("date", 1),
    previousDate: null,
    formattedPreviousDate: null,
    currentDate: dayjs().subtract(6, "week").set("date", 1),
    formattedCurrentDate: dayjs()
      .subtract(6, "week")
      .set("date", 1)
      .format("YYYY-MM"),
  },
};

const useLayersOverlayStore = create<LayersOverlayState & LayersOverlayActions>(
  (set) => {
    return {
      ...initialState,
      setStaticLayerVisibility: (layerName, value) =>
        set((state) => ({
          staticLayersVisibility: {
            ...state.staticLayersVisibility,
            [layerName]: value,
          },
        })),
      setDynamicLayerVisibility: (layerName, value) => {
        console.log("========visibility setter");
        set((state) => ({
          categorizedDynamicLayers: state.categorizedDynamicLayers.map(
            (category) => ({
              ...category,
              layers: category.layers.map((layer) =>
                layer.name === layerName ? { ...layer, visible: value } : layer
              ),
            })
          ),
        }));
      },
      setCategorizedLayers: async (projectData) => {
        const layers = await fetchLayers(projectData);
        const dynamicLayers = layers.map((layer) => ({
          ...layer,
          visible: false,
        }));
        const categorizedDynamicLayers = groupBy(dynamicLayers, "category");
        console.log("===========================", categorizedDynamicLayers);
        set({ categorizedDynamicLayers });
      },
      setHistoricalSatelliteDate: (date) =>
        set((state) => ({
          historicalSatelliteState: {
            ...state.historicalSatelliteState,
            previousDate: state.historicalSatelliteState.currentDate,
            formattedPreviousDate:
              state.historicalSatelliteState.formattedCurrentDate,
            currentDate: date,
            formattedCurrentDate: date.format("YYYY-MM"),
          },
        })),
    };
  }
);

export default useLayersOverlayStore;
