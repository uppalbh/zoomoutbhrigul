// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import http from "node:http";
import type { Plugin } from "vite";

const BACKEND = "http://127.0.0.1:8000";

// The server.proxy block below is the standard Vite way and works on a normal local
// `npm run dev`. Inside the Lovable sandbox the config wrapper drops server.proxy
// before Vite reads it, so the identical proxy is also installed as a middleware here,
// registered ahead of TanStack Start's SSR handler. Mounting on "/api" strips the
// prefix on the way in, matching the rewrite() rule below.
function apiProxy(): Plugin {
  const target = new URL(BACKEND);
  return {
    name: "api-proxy",
    configureServer: {
      order: "pre",
      handler(server) {
        server.middlewares.use("/api", (req, res, next) => {
          const upstreamPath = req.url && req.url.startsWith("/") ? req.url : "/";
          const upstream = http.request(
            {
              host: target.hostname,
              port: target.port || 80,
              path: upstreamPath,
              method: req.method,
              headers: { ...req.headers, host: target.host },
              agent: false,
            },
            (upstreamRes) => {
              const headers = { ...upstreamRes.headers };
              delete headers.connection;
              res.writeHead(upstreamRes.statusCode ?? 502, headers);
              upstreamRes.pipe(res);
            },
          );
          upstream.on("error", () => {
            res.writeHead(502, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                error: {
                  code: "BACKEND_UNREACHABLE",
                  stage: "proxy",
                  message: `Backend unreachable at ${BACKEND}.`,
                  retryable: true,
                },
              }),
            );
          });
          req.pipe(upstream);
        });
      },
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [apiProxy()],
    server: {
      proxy: {
        "/api": {
          target: BACKEND,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  },
});
