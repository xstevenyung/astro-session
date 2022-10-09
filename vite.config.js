import { resolve } from "node:path";
import { defineConfig } from "vite";
import pkg from "./package.json";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/index.ts"),
      name: "astro-session",
      // the proper extensions will be added
      fileName: "index",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: Object.keys(pkg.dependencies),
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
      },
    },
  },
});
