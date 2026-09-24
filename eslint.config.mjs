import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated or vendored output (all gitignored): Sanity studio build, Python venv, Playwright reports.
    "dist/**",
    ".venv/**",
    "ml/.cache/**",
    ".sanity/**",
    "test-results/**",
    "playwright-report/**",
    "tests/e2e/artifacts/**",
    "tests/e2e/tests/**",
  ]),
]);

export default eslintConfig;
