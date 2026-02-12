import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.jsx"], // Apply to TypeScript files
    rules: {
      "@typescript-eslint/no-unused-vars": "warn", // Change to "warn" or "off"
      "no-unused-vars": "off", // Turn off base rule to avoid conflicts
    },
  },
];

export default eslintConfig;