/** A shared, reactive preference store. SSR defaults to a fully static page. */
const QUERY = "(prefers-reduced-motion: no-preference)";
const listeners = new Set<() => void>();
let media: MediaQueryList | undefined;

function getMedia() {
  if (typeof window === "undefined" || !window.matchMedia) return undefined;
  media ??= window.matchMedia(QUERY);
  return media;
}
function notify() {
  listeners.forEach((listener) => listener());
}
export function subscribeMotionPreference(listener: () => void) {
  const query = getMedia();
  if (!query) return () => {};
  if (listeners.size === 0) query.addEventListener("change", notify);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) query.removeEventListener("change", notify);
  };
}
export function motionPreferenceSnapshot() {
  return getMedia()?.matches ?? false;
}
export function staticMotionSnapshot() {
  return false;
}
