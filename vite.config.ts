import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // cubing.js scramble generation runs in a module web worker that uses
  // top-level await, so the worker + dep bundling + final build all need an
  // es2022 target (es2020 has no TLA -> "Top-level await is not available").
  worker: {
    format: 'es',
  },
  esbuild: {
    target: 'es2022',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022',
    },
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        // cubing.js's scramble runs in a worker, but its shared primitives (Alg,
        // KPattern, comlink's exposeAPI) are also used on the main thread — e.g.
        // `scramble-display` (the 2D net) pulls cubing in eagerly. By default
        // Rollup parks those shared primitives in the app-entry chunk, so the
        // worker ends up importing the entire DOM app and dies on top-level
        // `document`/`HTMLElement` ("Module worker instantiation failed").
        //
        // Pin cubing's DOM-free core into its own chunk so both the app and the
        // worker import *that* instead of each other. Exclusions:
        //  - `twisty` — the 3D player (`extends HTMLElement`); must stay lazy and
        //    out of the worker's graph.
        //  - `search-worker-entry` / `search/inside` — the worker entry and its
        //    worker-side search impl; must stay standalone so Vite can still
        //    emit the worker as its own file.
        manualChunks(id) {
          if (!id.includes('/node_modules/cubing/')) return
          if (id.includes('/twisty/')) return
          if (id.includes('search-worker-entry') || id.includes('/search/inside')) return
          return 'cubing-core'
        },
      },
    },
    // cubing.js's scramble worker is emitted as a regular chunk; Vite wraps its
    // dynamic `import()` with `__vitePreload(fn, deps)`. When `deps` is
    // non-empty the helper runs `document.getElementsByTagName(...)` to inject
    // preload <link>s — but there's no `document` in a worker, so it throws
    // "document is not defined" and scramble generation dies (production only;
    // dev is unaffected). Disabling modulepreload empties that deps array, so
    // the worker just does a bare `import()` and never touches `document`.
    modulePreload: false,
    // Even with modulepreload off, Vite injects a CSS dependency for code-split
    // dynamic imports — so the worker's `__vitePreload` deps array still held an
    // app `.css` file, keeping the `document` branch alive. Bundling all CSS
    // into one file (loaded from index.html) leaves the worker's import with an
    // empty deps array. The app's CSS is a single small Tailwind bundle anyway.
    cssCodeSplit: false,
  },
})
