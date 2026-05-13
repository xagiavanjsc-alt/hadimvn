// ─── Service Worker — Hàn Quốc Ơi! (Full Offline PWA) ────────────────────────
// IMPORTANT: bump CACHE_VERSION on every breaking change so old caches are
// dropped on activate. Stale HTML referencing old hashed chunks is the #1
// cause of "black screen after login" on phones/macbooks.
const CACHE_VERSION = "v9";
const CACHE_NAME = `hanquocoi-${CACHE_VERSION}`;
const FONT_CACHE = `hanquocoi-fonts-${CACHE_VERSION}`;
const IMAGE_CACHE = `hanquocoi-images-${CACHE_VERSION}`;
const VOCAB_CACHE = `hanquocoi-vocab-${CACHE_VERSION}`;

// Assets to pre-cache on install. DO NOT include "/" - caching index.html
// causes the SW to serve stale HTML referencing old chunk hashes after a
// deploy, leading to broken pages (black screen).
const PRECACHE_URLS = [
  "/offline.html",
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Ignore errors for optional resources
      });
    }).then(() => self.skipWaiting())
  );
});

// ─── Activate — clean old caches ─────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  const validCaches = [CACHE_NAME, FONT_CACHE, IMAGE_CACHE, VOCAB_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !validCaches.includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Background Sync for offline study data ───────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-study-data") {
    event.waitUntil(syncStudyData());
  }
});

async function syncStudyData() {
  // Sync any pending study data when back online
  const cache = await caches.open(VOCAB_CACHE);
  const keys = await cache.keys();
  const pendingKeys = keys.filter(k => k.url.includes("pending-sync"));
  for (const key of pendingKeys) {
    try {
      const response = await cache.match(key);
      if (response) {
        const data = await response.json();
        // Would sync to Supabase here
        await cache.delete(key);
      }
    } catch {
      // Keep for next sync
    }
  }
}

// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data = { title: "Hàn Quốc Ơi!", body: "Đến giờ học rồi!", icon: "/icon-192.png" };
  try { data = { ...data, ...event.data.json() }; } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/icon-192.png",
      badge: "/icon-72.png",
      tag: "study-reminder",
      renotify: true,
      actions: [
        { action: "open", title: "Học ngay" },
        { action: "dismiss", title: "Để sau" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "open" || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow("/dashboard");
      })
    );
  }
});

// ─── Fetch — cache strategies ─────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, supabase API calls
  if (request.method !== "GET") return;
  if (url.protocol === "chrome-extension:") return;
  if (url.hostname.includes("supabase.co")) return;
  if (url.hostname.includes("supabase.io")) return;
  if (url.pathname.startsWith("/rest/")) return;
  if (url.pathname.startsWith("/auth/")) return;
  if (url.pathname.startsWith("/functions/")) return;

  // Google Fonts — Cache First (permanent)
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => cached || new Response("", { status: 503 }));
        })
      )
    );
    return;
  }

  // Readdy AI images — Cache First (long-lived)
  if (false) { // Disabled external image caching
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => cached || new Response("", { status: 503 }));
        })
      )
    );
    return;
  }

  // YouTube thumbnails — Cache First
  if (url.hostname === "img.youtube.com") {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => cached || new Response("", { status: 503 }));
        })
      )
    );
    return;
  }

  // Public CDN assets (remixicon, fontawesome) — Cache First
  if (
    url.hostname.includes("cdnjs.cloudflare.com") ||
    url.hostname.includes("cdn.jsdelivr.net") ||
    url.hostname.includes("unpkg.com")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => cached || new Response("", { status: 503 }));
        })
      )
    );
    return;
  }

  // App JS/CSS chunks — Stale While Revalidate
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/assets/") ||
      url.pathname.endsWith(".js") ||
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith(".woff2") ||
      url.pathname.endsWith(".woff") ||
      url.pathname.endsWith(".png") ||
      url.pathname.endsWith(".jpg") ||
      url.pathname.endsWith(".svg") ||
      url.pathname.endsWith(".ico"))
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => cached || new Response("", { status: 503 }));
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // HTML navigation — Network ONLY with offline page fallback.
  // Critical: never serve stale cached HTML. After a deploy, a cached
  // index.html references chunk hashes that no longer exist on the server,
  // resulting in a black screen. Always go to network; on failure, show the
  // offline page (which is static and doesn't reference hashed chunks).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/offline.html").then(off =>
          off || new Response(
            `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hàn Quốc Ơi! - Offline</title><style>body{font-family:sans-serif;background:#0f1117;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center}h1{font-size:2rem;margin-bottom:1rem}p{color:rgba(255,255,255,.5)}button{margin-top:1.5rem;padding:.75rem 2rem;background:#e8c84a;color:#000;border:none;border-radius:.5rem;font-weight:700;cursor:pointer;font-size:1rem}</style></head><body><div><h1>📚 Hàn Quốc Ơi!</h1><p>Bạn đang offline. Một số tính năng cần kết nối internet.</p><button onclick="location.reload()">Thử lại</button></div></body></html>`,
            { headers: { "Content-Type": "text/html" } }
          )
        )
      )
    );
    return;
  }
});

// ─── Message handler — cache vocab data for offline ──────────────────────────
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CACHE_VOCAB") {
    const { data, key } = event.data;
    caches.open(VOCAB_CACHE).then(cache => {
      cache.put(
        new Request(`/offline-vocab/${key}`),
        new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } })
      );
    });
  }
  if (event.data && event.data.type === "GET_CACHED_VOCAB") {
    const { key } = event.data;
    caches.open(VOCAB_CACHE).then(async cache => {
      const response = await cache.match(`/offline-vocab/${key}`);
      const data = response ? await response.json() : null;
      event.source.postMessage({ type: "CACHED_VOCAB_RESULT", key, data });
    });
  }
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
