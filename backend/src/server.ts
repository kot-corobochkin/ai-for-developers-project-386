import { createApp } from "./app.js";

const app = createApp();
const port = Number(process.env.PORT || 8000);

try {
  await app.listen({ host: "0.0.0.0", port });
  console.log(`Calendar API listening on http://localhost:${port}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
