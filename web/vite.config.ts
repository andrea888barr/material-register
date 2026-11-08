import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
  server: {
    // Forward API calls to the tRPC server, so the browser only talks to one address (no CORS).
    proxy: { "/trpc": "http://localhost:3001" },
  },
});
