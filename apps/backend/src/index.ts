import { serve } from "@hono/node-server";

import { createBackendApp } from "./app.js";

const port = Number(process.env.PORT ?? 8787);

serve(
  {
    fetch: createBackendApp().fetch,
    port
  },
  (info) => {
    console.log(`@edu-ai/backend listening on http://localhost:${info.port}`);
  }
);
