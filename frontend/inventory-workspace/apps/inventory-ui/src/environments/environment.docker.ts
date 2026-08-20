export const environment = {
  // In Docker Compose, nginx (this app's own container) reverse-proxies
  // /api and /health to the api service — same-origin, so no CORS needed
  // and no hardcoded container hostname/port baked into the bundle.
  apiBaseUrl: '',
};
