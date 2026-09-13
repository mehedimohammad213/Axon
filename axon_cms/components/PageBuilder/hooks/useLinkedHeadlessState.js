import { useState, useEffect } from "react";

/**
 * Keeps local component state in sync when linked `_headless` data is refreshed
 * from the page API (e.g. after menus, cards, or sliders are updated elsewhere).
 */
export const useLinkedHeadlessState = (
  headless,
  deriveState,
  deps = [headless]
) => {
  const [state, setState] = useState(() => deriveState(headless));

  useEffect(() => {
    setState(deriveState(headless));
  }, deps);

  return [state, setState];
};

export default useLinkedHeadlessState;
