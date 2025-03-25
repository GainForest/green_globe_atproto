import { useCallback, useEffect, useState } from "react";
import { getViewsFromStates } from "../store/utils/project";
import useProjectOverlayStore from "../../ProjectOverlay/store";
import useBiodiversityStore from "../../ProjectOverlay/Biodiversity/store";
import useBiodiversityPredictionsStore from "../../ProjectOverlay/Biodiversity/Predictions/store";
import useCommunityStore from "../../ProjectOverlay/Community/store";
import useRouteStore from "../store";

const useReadViews = () => {
  const isStoreInitialized = useRouteStore((state) => state.initialized);

  const normalizeViews = useCallback(
    (views: ReturnType<typeof getViewsFromStates>) => {
      if (!isStoreInitialized) {
        return null;
      }
      return views;
    },
    [isStoreInitialized]
  );
  const [views, setViews] = useState(normalizeViews(getViewsFromStates()));

  const projectOverlayTab = useProjectOverlayStore((state) => state.activeTab);
  const biodiversityTab = useBiodiversityStore((state) => state.activeTab);
  const biodiversityPredictionsTab = useBiodiversityPredictionsStore(
    (state) => state.page
  );
  const communityTab = useCommunityStore((state) => state.activeTab);

  useEffect(() => {
    setViews(normalizeViews(getViewsFromStates()));
  }, [
    projectOverlayTab,
    biodiversityTab,
    biodiversityPredictionsTab,
    communityTab,
  ]);

  return views;
};

export default useReadViews;
