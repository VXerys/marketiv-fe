import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(rootDir, "src"),
    },
  },
  test: {
    environment: "node",
    include: [
      "00_BACKEND/tests/unit/oauth-callback.service.test.ts",
      "src/services/auth/__tests__/**/*.test.ts",
      "src/components/features/**/__tests__/**/*.test.tsx",
      "src/lib/onboarding/__tests__/**/*.test.ts",
      "src/services/**/__tests__/**/*.test.ts",
    ],
    exclude: ["node_modules", "00_BACKEND/tests/e2e"],
    environmentMatchGlobs: [
      ["src/components/features/**/__tests__/**/*.test.tsx", "jsdom"],
    ],
  },
});
