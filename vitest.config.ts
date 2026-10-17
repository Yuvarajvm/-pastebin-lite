import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "node:path";

const env = loadEnv("test", process.cwd(), "");

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "next/headers": path.resolve(__dirname, "node_modules/next/headers.js")
    }
  },
  test: {
    server: {
      deps: {
        inline: ["@neondatabase/auth"]
      }
    },
    environment: "node",
    include: ["tests/*.test.ts"],
    env,
    hookTimeout: 30000,
    testTimeout: 30000
  }
});
