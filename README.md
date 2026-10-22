# madie-layout

This is a single-spa Application responsible for the MADiE application's layout

## Development

Use Node.js 22.15 or newer. Run `npm ci`, then `npm start` to build and serve
the SystemJS microfrontend on port 8500 with webpack-dev-server and hot reload.

For an alternate port, run `npx webpack serve --port 8501`.

Run `npm run test:styles` for utility CSS checks.

webpack-dev-server is a development-only dependency. Its transitive
`http-proxy-middleware` / `micromatch` / `braces` chain currently produces four
high audit findings from the unpatched
[braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
It is retained to preserve hot reload and is not included in production bundles.

Layout utilities use prefixed Tailwind classes (`ml:`), compiled by PostCSS.
Tailwind Preflight is not loaded: `GlobalStyles` preserves the existing global
reset and form styles so upgrading the utility compiler does not restyle other
microfrontends.
