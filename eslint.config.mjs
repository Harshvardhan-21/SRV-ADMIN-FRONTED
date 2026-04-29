import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Admin panel uses dynamic API responses — any is acceptable
      "@typescript-eslint/no-explicit-any": "off",
      // Unused vars as warnings only, not errors
      "@typescript-eslint/no-unused-vars": "warn",
      // Admin panel uses regular <img> tags for dynamic content
      "@next/next/no-img-element": "off",
      // These patterns are fine in admin panel components
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      // Unescaped entities in JSX
      "react/no-unescaped-entities": "off",
      // Exhaustive deps — warn only
      "react-hooks/exhaustive-deps": "warn",
    },
  },
]);

export default eslintConfig;
