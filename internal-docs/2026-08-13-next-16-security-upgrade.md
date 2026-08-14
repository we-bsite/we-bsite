# Next.js 16 security upgrade

## Decision

Upgrade the site from Next.js 13.0.0 to Next.js 16.3.1 and require Node.js 20.9 or later. Keep React 18 because the site uses the Pages Router, which continues to use the React version declared in `package.json`.

The dependency audit reported eight vulnerabilities before this work. Next.js accounted for the critical advisories. The unused Vite dependency and the direct Nano ID dependency accounted for the remaining advisories. Both the full dependency audit and the production-only audit now report zero vulnerabilities.

## Compatibility work

Next.js 16 removed the `next lint` command and uses ESLint's flat configuration. The `lint` script now runs ESLint directly through `eslint.config.mjs`.

Turbopack requires PostCSS configuration to expand the existing Tailwind directives. `postcss.config.mjs` now runs Tailwind CSS and Autoprefixer. The production CSS contains no raw Tailwind directives.

The TypeScript configuration now uses bundler module resolution and the React JSX transform. The stale Vite project reference and `tsconfig.node.json` were removed because the repository has no Vite entry point or configuration.

The `cursor-chat` package bundled a private copy of Yjs. Loading it with the application's Yjs dependency caused duplicate constructors and a runtime warning. The package was replaced with a local cursor chat module that uses the shared Yjs document and keeps the existing cursor and chat behavior. Its stylesheet is compiled into the site instead of loading from unpkg.

The local storage hook now uses `useSyncExternalStore`. This provides a stable server snapshot during rendering and synchronizes updates from the current tab and other tabs.

## Deployment requirements

- Build and run the site with Node.js 20.9 or later.
- Deploy the frontend from this branch after the Cloudflare Worker and migrated data are available.
- Keep the Pages Router. Moving to the App Router is not required for this security upgrade.

## Validation

The following checks pass on Node.js 24.6.0:

- `npm audit`
- `npm audit --omit=dev`
- `npm ls --all`
- `npm test`
- `npm run lint`
- `npm run build`
- Production-server requests to `/` and `/about`
- Compiled CSS check for raw Tailwind directives and the removed cursor-chat CDN URL

An interactive browser check was not available in the Conductor session. The production build, server responses, backend integration test, and compiled assets were validated locally.
