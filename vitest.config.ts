import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/{activities,catalog,cosmetics,dropPools,mastery,save,sets,skillAcquisition,training,xp}.ts"],
      thresholds: {
        lines: 65,
        functions: 65,
        statements: 60,
        branches: 45,
      },
    },
  },
});
