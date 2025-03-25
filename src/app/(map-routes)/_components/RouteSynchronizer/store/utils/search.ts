import { RouteState } from "..";
import useSearchOverlayStore from "../../../SearchOverlay/store";
import { RouteStateCatalog } from "../types";
import { generateQueryParamsFromObject, isStateChanged } from "./index";
export const dispatchSearchStatesFromURL = (
  searchParams: URLSearchParams
): RouteState | null => {
  const query = searchParams.get("q");
  if (query) {
    useSearchOverlayStore.getState().setSearchQuery(query);
  }

  const state = {
    _routeType: "search",
    config: {
      q: query,
    },
  } satisfies RouteState;

  return isStateChanged(state) ? state : null;
};

export const generateURLFromSearchStates = (
  state: RouteStateCatalog["search"]
) => {
  return `/search?${generateQueryParamsFromObject(state.config)}`;
};
