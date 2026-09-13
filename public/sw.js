/**
 * Penalty Merchants service worker.
 *
 * Hand-written rather than generated: the app builds with `next build
 * --turbopack`, and the usual PWA plugins (next-pwa, @serwist/next) are webpack
 * plugins whose hook never runs under Turbopack — they emit nothing while the
 * build still reports success.
 *
 * The rule that shapes everything below: pages render one signed-in user's
 * balances and match history, so **no HTML is ever written to a cache**.
 * Navigations are network-only with a static offline fallback. Only immutable,
 * non-personal subresources are cached.
 */

const VERSION = "v1";

const PRECACHE = `pm-precache-${VERSION}`;
const STATIC = `pm-static-${VERSION}`;
const IMG = `pm-img-${VERSION}`;
const ASSETS = `pm-assets-${VERSION}`;

const EXPECTED = new Set([PRECACHE, STATIC, IMG, ASSETS]);

const OFFLINE_URL = "/offline.html";
const PRECACHE_URLS = [OFFLINE_URL, "/icons/icon-192.png"];

/** Cap on the /_next/image cache, trimmed oldest-first. */
const IMG_MAX_ENTRIES = 60;

// ---------------------------------------------------------------- lifecycle

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) =>
      // `cache: "reload"` bypasses the HTTP cache so a deploy that only changes
      // offline.html still lands, without needing a VERSION bump.
      cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: "reload" }))),
    ),
  );
  // No skipWaiting() here on purpose — see the message handler.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("pm-") && !EXPECTED.has(name))
          .map((name) => caches.delete(name)),
      );
      await trimCache(IMG, IMG_MAX_ENTRIES);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  // Only ever activate a waiting worker when the user asks for it via the
  // "New version available" toast. Calling skipWaiting() at install time swaps
  // the worker mid-session while the rendered page still needs the previous
  // build's /_next/static chunks, which surfaces as chunk-load errors.
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ------------------------------------------------------------------- routing

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Anything not a plain same-origin GET is none of our business. This single
  // check covers every Server Action POST, the sign-out form post, and the
  // cross-origin Google avatar images (whose opaque responses are per-user and
  // would burn through the storage quota).
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (!url.protocol.startsWith("http")) return;
  if (url.origin !== self.location.origin) return;
  if (request.headers.has("range")) return;

  // Must come before the navigation branch: signIn("google") is a real
  // top-level navigation to /api/auth/signin/google, so it *is* mode
  // "navigate". Intercepting it would let a flaky network swallow the OAuth
  // handshake and show the offline screen instead.
  if (url.pathname.startsWith("/api/")) return;

  // Client-side RSC navigations and prefetches. Let these fail naturally so the
  // Next router falls back to a hard navigation.
  if (
    request.headers.get("RSC") === "1" ||
    request.headers.has("Next-Action") ||
    url.searchParams.has("_rsc")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigate(event));
    return;
  }

  if (PRECACHE_URLS.includes(url.pathname)) {
    event.respondWith(cacheFirst(event, PRECACHE));
    return;
  }

  // Content-hashed and immutable. Also covers Inter: next/font/google
  // self-hosts the woff2 under /_next/static/media at build time, so there are
  // no Google Fonts requests to handle.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(event, STATIC));
    return;
  }

  // The `url` param embeds a content hash, so each full URL is immutable.
  if (url.pathname.startsWith("/_next/image")) {
    event.respondWith(cacheFirst(event, IMG, IMG_MAX_ENTRIES));
    return;
  }

  // Files served straight out of /public — not content-hashed, so revalidate.
  if (/\.(?:svg|png|jpe?g|webp|gif|ico|woff2?)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event, ASSETS));
  }
});

// ---------------------------------------------------------------- strategies

async function handleNavigate(event) {
  try {
    const preloaded = await event.preloadResponse;
    if (preloaded) return preloaded;

    // Pass the Request through untouched. Rebuilding it (fetch(url), or
    // new Request(url)) resets redirect:"manual" to "follow", which turns
    // middleware's 307 to /signin into a redirected response that cannot
    // legally be returned to a navigation — breaking sign-in and the OAuth
    // return leg with "The response was redirected but the request was not".
    return await fetch(event.request);
  } catch {
    // Only a genuine network failure reaches here; a 5xx is a real Response and
    // is returned above so the app's own error page still renders.
    const cached = await caches.match(OFFLINE_URL, { cacheName: PRECACHE });
    return cached ?? Response.error();
  }
}

async function cacheFirst(event, cacheName, max) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(event.request);
  if (hit) return hit;

  const response = await fetch(event.request);
  if (isCacheable(response)) {
    await cache.put(event.request, response.clone());
    if (max) event.waitUntil(trimCache(cacheName, max));
  }
  return response;
}

async function staleWhileRevalidate(event, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(event.request);

  const revalidate = fetch(event.request)
    .then(async (response) => {
      if (isCacheable(response)) await cache.put(event.request, response.clone());
      return response;
    })
    .catch(() => undefined);

  if (hit) {
    event.waitUntil(revalidate);
    return hit;
  }
  return (await revalidate) ?? Response.error();
}

/** Only store our own complete, successful responses. */
function isCacheable(response) {
  return Boolean(response) && response.ok && response.type === "basic";
}

/** Trim a cache to `max` entries, oldest first (Cache keys are insertion-ordered). */
async function trimCache(cacheName, max) {
  if (!(await caches.has(cacheName))) return;
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  await Promise.all(keys.slice(0, keys.length - max).map((key) => cache.delete(key)));
}
