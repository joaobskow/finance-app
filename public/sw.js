// Service worker mínimo — só o necessário para o navegador considerar o
// site "instalável" (PWA). Não faz cache agressivo de nada por enquanto.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

// Passa as requisições direto pra rede (sem cache customizado por enquanto)
self.addEventListener("fetch", () => {});
