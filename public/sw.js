// public/sw.js
// Service Worker — Calendário do Casal
// Estratégia: Cache-First para assets estáticos, Network-First para API

const CACHE_NAME = "casal-v1";
const STATIC_CACHE = "casal-static-v1";
const API_CACHE = "casal-api-v1";

const STATIC_ASSETS = [
  "/",
  "/offline",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// ─── Install ───────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ──────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== API_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ─────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora extensões do Chrome, websockets e POST requests
  if (
    url.protocol === "chrome-extension:" ||
    request.method !== "GET" ||
    url.hostname !== self.location.hostname
  )
    return;

  // API routes → Network-First (com fallback para cache)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Assets estáticos (_next/static) → Cache-First
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Páginas → Stale-While-Revalidate
  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
});

// ─── Estratégias ───────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? offlineFallback();
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  return cached ?? fetchPromise;
}

function offlineFallback() {
  return caches.match("/offline");
}

// ─── Push Notifications ────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body ?? "Você tem um novo lembrete!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    image: data.image,
    vibrate: [100, 50, 100],
    data: { url: data.url ?? "/" },
    actions: [
      { action: "open", title: "Ver agora" },
      { action: "dismiss", title: "Dispensar" },
    ],
    tag: data.tag ?? "casal-notification",
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title ?? "Calendário do Casal", options)
  );
});

// ─── Notification Click ────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const existing = clientList.find((c) => c.url === url && "focus" in c);
        if (existing) return existing.focus();
        return clients.openWindow(url);
      })
  );
});

// ─── Background Sync ───────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-events") {
    event.waitUntil(syncPendingEvents());
  }
});

async function syncPendingEvents() {
  // Lê fila de eventos pendentes do IndexedDB e reenvia
  // Implementação completa em src/lib/utils/offline-queue.ts
  const db = await openIDB();
  const tx = db.transaction("pending-events", "readwrite");
  const store = tx.objectStore("pending-events");
  const pending = await store.getAll();

  await Promise.allSettled(
    pending.map(async (item) => {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.data),
      });
      if (res.ok) await store.delete(item.id);
    })
  );
}

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("casal-offline", 1);
    req.onupgradeneeded = () =>
      req.result.createObjectStore("pending-events", {
        keyPath: "id",
        autoIncrement: true,
      });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
