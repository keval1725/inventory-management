export const environment = {
  // nx serve runs the Angular dev server and the .NET API as separate
  // origins/ports — the dev-only CORS policy on the API (see Program.cs)
  // is what makes this absolute cross-origin call work locally.
  apiBaseUrl: 'http://localhost:5299',
};
