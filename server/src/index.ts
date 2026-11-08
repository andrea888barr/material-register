import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { env } from "./env.ts";
import { appRouter } from "./router.ts";

const server = createHTTPServer({
  router: appRouter,
  basePath: "/trpc/",
  onError: ({ path, error }) => {
    // Invalid input is the client's problem; anything else is a bug worth logging in full.
    if (error.code === "BAD_REQUEST") return;
    console.error(`tRPC error on ${path ?? "unknown"}:`, error);
  },
});

server.listen(env.port);
console.log(`API listening on http://localhost:${env.port}/trpc`);
