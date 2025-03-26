import useRouteStore, { RouteState } from "..";

export const generateQueryParamsFromObject = (
  obj: Record<string, unknown>,
  options: {
    onlyKeys?: string[];
    excludeKeys?: string[];
  } = {}
) => {
  const { onlyKeys, excludeKeys } = options;

  return Object.entries(obj)
    .filter(([key]) => {
      if (onlyKeys) {
        return onlyKeys.includes(key);
      }
      if (excludeKeys) {
        return !excludeKeys.includes(key);
      }
      return true;
    })
    .filter(([, value]) =>
      ["string", "number", "boolean"].includes(typeof value)
    )
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
};

export const verifyKeyType = <T extends readonly string[]>(
  key: unknown,
  allowedKeys: T
): key is T[number] => {
  return typeof key === "string" && allowedKeys.includes(key);
};

export const isStateChanged = (
  state: Partial<RouteState>,
  keys: (keyof RouteState)[]
): boolean => {
  const currentState: Record<string, unknown> = {};
  keys.forEach((key) => {
    currentState[key as string] = useRouteStore.getState()[key];
  });
  try {
    return JSON.stringify(state) !== JSON.stringify(currentState);
  } catch (error) {
    console.error(error);
    return false;
  }
};
