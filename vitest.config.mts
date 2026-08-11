import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: [
      "00_BACKEND/tests/unit/oauth-callback.service.test.ts",
      "src/lib/onboarding/__tests__/**/*.test.ts",
      "src/services/**/__tests__/**/*.test.ts",
    ],
    exclude: ["node_modules", "00_BACKEND/tests/e2e"],
  },
});
