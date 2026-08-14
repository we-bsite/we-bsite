// ABOUTME: Configures ESLint for the Next.js application and repository scripts.
// ABOUTME: Uses the flat Core Web Vitals rules required by the current Next.js tooling.

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  globalIgnores([
    ".context/**",
    ".next/**",
    ".wrangler/**",
    "build/**",
    "next-env.d.ts",
    "out/**",
    "worker/.wrangler/**",
  ]),
]);
