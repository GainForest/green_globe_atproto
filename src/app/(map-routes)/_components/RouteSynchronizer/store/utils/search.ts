import useSearchOverlayStore from "../../../SearchOverlay/store";
import { RouteDependentState, RouteStateCatalog } from "../types";
import { generateQueryParamsFromObject, isStateChanged } from "./index";
export const dispatchSearchStatesFromURL = (
  searchParams: URLSearchParams
): RouteDependentState | null => {
  const query = searchParams.get("q");
  if (query) {
    useSearchOverlayStore.getState().setSearchQuery(query);
  }

  const state = {
    _routeType: "search",
    config: {
      q: query,
    },
  } satisfies RouteDependentState;
  const stateKeys = Object.keys(state) as (keyof RouteDependentState)[];

  return isStateChanged(state, stateKeys) ? state : null;
};

export const generateURLFromSearchStates = (
  state: RouteStateCatalog["search"]
) => {
  return `/search?${generateQueryParamsFromObject(state.config)}`;
};
