import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@booking-code-converter/shared": fileURLToPath(new URL("./shared/src", import.meta.url)),
    },
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        module: "ESNext",
        moduleResolution: "bundler",
      },
    },
  },
});
