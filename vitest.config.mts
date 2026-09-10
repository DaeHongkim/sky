import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    globalSetup: ["tests/setup/global-setup.ts"],
    testTimeout: 20000,
    hookTimeout: 60000,
    fileParallelism: false,
    isolate: false,
  },
});
