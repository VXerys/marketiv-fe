import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["00_BACKEND/tests/unit/oauth-callback.service.test.ts"],
    exclude: ["node_modules", "00_BACKEND/tests/e2e"],
  },
});
