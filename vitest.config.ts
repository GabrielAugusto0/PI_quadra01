import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  // reservation-time.test.ts also imports mobile/reservation-time.ts. Without this,
  // esbuild would load mobile/tsconfig.json, which extends "expo/tsconfig.base"
  // (only installed inside mobile/), and the test suite would fail to load.
  esbuild: { tsconfigRaw: "{}" },
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
  },
});
