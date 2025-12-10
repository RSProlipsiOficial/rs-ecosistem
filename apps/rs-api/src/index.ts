import app from "./app";
import { env } from "./config/env";

async function main() {
  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    app.log.info(`API up on http://localhost:${env.PORT}${env.API_PREFIX}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
