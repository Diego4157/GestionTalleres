// Service Worker mínimo para instalabilidad PWA.
// Deliberadamente NO cachea nada: la app maneja sesiones y datos sensibles del taller,
// por lo que todas las peticiones van siempre a la red.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // Passthrough: el navegador resuelve la petición normalmente.
});
