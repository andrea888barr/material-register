import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode (as requested in brief): no server rendering; the build outputs static files.
  ssr: false,
  // Opt in to React Router v8 behaviour early. This app uses none of the affected
  // features (middleware, loaders/actions, server requests); it silences the startup warnings.
  future: {
    v8_middleware: true,
    v8_splitRouteModules: true,
    v8_viteEnvironmentApi: true,
    v8_passThroughRequests: true,
    v8_trailingSlashAwareDataRequests: true,
  },
} satisfies Config;
