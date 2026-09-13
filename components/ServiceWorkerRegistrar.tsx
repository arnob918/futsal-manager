"use client";

import { useEffect } from "react";
import { toast } from "sonner";

// public/sw.js is a static file, so its bytes are often identical across
// deploys — and an identical script URL means the browser never re-runs
// install, freezing the precached offline shell. The build-stamped query
// string forces a fresh install on every deploy.
const SW_URL = `/sw.js?v=${process.env.NEXT_PUBLIC_SW_VERSION ?? "dev"}`;

/** Installed PWAs get resumed rather than reloaded, so poll on focus. */
const UPDATE_CHECK_INTERVAL_MS = 60_000;

/**
 * Registers the service worker and surfaces updates. Rendered only for
 * signed-in users, alongside the manifest link in app/layout.tsx.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // Stop a worker left over from a production build from fighting
      // Turbopack's HMR with a stale cache.
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => registrations.forEach((r) => r.unregister()))
        .catch(() => {});
      return;
    }

    let cancelled = false;
    let registration: ServiceWorkerRegistration | undefined;
    let lastUpdateCheck = 0;

    // The guard matters: without it this loops in iOS standalone.
    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    const promptToReload = (waiting: ServiceWorker) => {
      toast("New version available", {
        description: "Reload to get the latest.",
        duration: Infinity,
        action: {
          label: "Reload",
          onClick: () => waiting.postMessage({ type: "SKIP_WAITING" }),
        },
      });
    };

    // An installed worker is only an *update* when something already controls
    // the page; otherwise it's the very first install and there is nothing to
    // tell the user about.
    const watchInstalling = (worker: ServiceWorker | null) => {
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          promptToReload(worker);
        }
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible" || !registration) return;
      const now = Date.now();
      if (now - lastUpdateCheck < UPDATE_CHECK_INTERVAL_MS) return;
      lastUpdateCheck = now;
      registration.update().catch(() => {});
    };

    navigator.serviceWorker
      .register(SW_URL, { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        if (cancelled) return;
        registration = reg;
        lastUpdateCheck = Date.now();

        // Three separate ways a new worker can show up. Miss one and updates
        // silently never reach the user.
        if (reg.waiting && navigator.serviceWorker.controller) {
          promptToReload(reg.waiting);
        }
        watchInstalling(reg.installing);
        reg.addEventListener("updatefound", () => watchInstalling(reg.installing));

        document.addEventListener("visibilitychange", onVisibilityChange);
      })
      .catch(() => {
        // Nothing the user can act on; the app works fine without the worker.
      });

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
