import * as React from "react";

// It's good practice to keep constants like this at the top level.
const MOBILE_BREAKPOINT = 768;

/**
 * A custom React hook to detect if the user is on a mobile-sized screen.
 * This hook is server-side rendering (SSR) safe.
 *
 * @returns {boolean} True if the viewport width is less than 768px, otherwise false.
 */
export function useIsMobile() {
  // REFACTOR 1: Use a lazy initializer with useState.
  // This function only runs ONCE on the client, making it SSR-safe because
  // it won't try to access `window` on the server.
  const [isMobile, setIsMobile] = React.useState(() => {
    // Check if `window` is defined before trying to access it.
    if (typeof window === "undefined") {
      return false; // Default to false on the server
    }
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  React.useEffect(() => {
    // This effect will only run on the client, where `window` is available.
    const mediaQueryList = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // This handler will be called whenever the media query state changes.
    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      // REFACTOR 2: Use the `.matches` property from the event. It's more direct.
      setIsMobile(event.matches);
    };

    // Set the initial state correctly on mount (in case it changed since the initial render)
    setIsMobile(mediaQueryList.matches);

    // Add the event listener. Using the newer `addEventListener` is good practice.
    mediaQueryList.addEventListener("change", handleMediaQueryChange);

    // This is the cleanup function. It runs when the component unmounts.
    return () => {
      mediaQueryList.removeEventListener("change", handleMediaQueryChange);
    };
  }, []); // The empty dependency array ensures this effect runs only on mount and unmount.

  return isMobile;
}