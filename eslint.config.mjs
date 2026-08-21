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
    "backup/**",
    ".agents/**",
    "testing-product-python/**",
  ]),
  {
    rules: {
      // The legacy codebase intentionally permits explicit boundary types while
      // TypeScript's standalone strict check remains the source of truth.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // Existing remote/blob images intentionally use native image elements.
      "@next/next/no-img-element": "off",

      // These presentation rules do not indicate runtime or type failures.
      "react/no-unescaped-entities": "off",
      "@next/next/no-page-custom-font": "off",
    },
  },
]);

export default eslintConfig;
