# madie-layout

This is a single-spa Application responsible for the MADiE application's layout

## Development

Use Node.js 22.15 or newer. Run `npm ci`, then `npm start` to build and serve
the SystemJS microfrontend on port 8500. Webpack polls source files and rebuilds
automatically; refresh the browser manually after a successful rebuild. HMR and
automatic browser refresh are not provided. The development server uses Node's
HTTP server instead of webpack-dev-server to avoid its vulnerable dependency chain.

Use `PORT=8501 npm start` or `npm start -- --port 8501` to select another port.
The server exposes compiled assets and `/public/` fonts/images with CORS enabled,
and returns HTTP 503 until a successful build is available.

Run `npm run test:server` for the development-server checks and
`npm run test:styles` for utility CSS checks.

Layout utilities use prefixed Tailwind classes (`ml:`), compiled by PostCSS.
Tailwind Preflight is not loaded: `GlobalStyles` preserves the existing global
reset and form styles so upgrading the utility compiler does not restyle other
microfrontends.
