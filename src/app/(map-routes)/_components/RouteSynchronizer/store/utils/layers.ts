import dayjs from "dayjs";
import { generateQueryParamsFromObject, isStateChanged } from "./index";
import { RouteState } from "..";
import { LayersState } from "../types";
import useLayersOverlayStore from "../../../LayersOverlay/store";
export const dispatchLayersStatesFromURL = (
  searchParams: URLSearchParams
): LayersState | null => {
  const historicalSatelliteState =
    useLayersOverlayStore.getState().historicalSatelliteState;
  const { formattedCurrentDate, minDate, maxDate } = historicalSatelliteState;

  const historicalSatelliteDateParam = searchParams.get(
    "historical-satellite-date"
  );
  let historicalSatelliteDate = null;
  if (historicalSatelliteDateParam) {
    let isValidDate = false;
    try {
      const date = dayjs(historicalSatelliteDateParam, "YYYY-MM");
      if (
        date.isValid() &&
        (date.isAfter(minDate) || date.isSame(minDate)) &&
        (date.isBefore(maxDate) || date.isSame(maxDate))
      ) {
        isValidDate = true;
      }
    } catch (error) {
      console.error(error);
      isValidDate = false;
    }

    if (isValidDate) {
      historicalSatelliteDate = historicalSatelliteDateParam;
    }
  }

  const enabledLayersParam = searchParams.get("enabled-layers");
  const enabledLayers: string[] = [];
  if (enabledLayersParam) {
    const enabledLayersArray = enabledLayersParam.split(",");
    const enabledLayersSet = new Set(enabledLayersArray);
    enabledLayers.push(...Array.from(enabledLayersSet));
  }

  if (
    historicalSatelliteDate !== null &&
    formattedCurrentDate !== historicalSatelliteDate
  ) {
    useLayersOverlayStore
      .getState()
      .setStaticLayerVisibility("historicalSatellite", true);
    useLayersOverlayStore
      .getState()
      .setHistoricalSatelliteDate(dayjs(historicalSatelliteDate, "YYYY-MM"));
  }

  // Dedicated store states for enabled layers are handled in the stores themselves.

  const state: LayersState = {
    "historical-satellite-date": historicalSatelliteDate,
    "enabled-layers": enabledLayers,
  };
  const stateKeys = Object.keys(state) as (keyof RouteState)[];

  return isStateChanged(state, stateKeys) ? state : null;
};

export const generateQueryParamsFromLayersStates = (state: LayersState) => {
  const paramsWithoutEnabledLayers = generateQueryParamsFromObject(state, {
    excludeKeys: state["enabled-layers"].length === 0 ? ["enabled-layers"] : [],
  }).trim();
  const enabledLayersParams = state["enabled-layers"]
    .reduce((acc, layerName, index) => {
      if (layerName.trim() === "") {
        return acc;
      }
      return `${acc}${layerName}${
        index === state["enabled-layers"].length - 1 ? "" : ","
      }`;
    }, "")
    .trim();
  if (paramsWithoutEnabledLayers.length === 0) {
    if (enabledLayersParams.length === 0) {
      return "";
    }
    return `enabled-layers=${enabledLayersParams}`;
  }
  return `${paramsWithoutEnabledLayers}&enabled-layers=${enabledLayersParams}`;
};

export const joinURLParams = (url: string, params: string) => {
  const trimmedURL = url.trim();
  const trimmedParams = params.trim();
  if (trimmedParams.length === 0) {
    return trimmedURL;
  }
  if (trimmedURL.includes("?")) {
    if (trimmedURL.endsWith("?")) {
      return `${trimmedURL}${trimmedParams}`;
    }
    return `${trimmedURL}&${trimmedParams}`;
  }
  return `${trimmedURL}?${trimmedParams}`;
};
