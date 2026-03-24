import "./load-env.js";
import express from "express";
import helmet from "helmet";
import { appRoutes } from "@/routes.js";
import { errorHandler } from "@/middlewares/error-handler.middleware.js";
import { logger } from "@/infra/logger.js";
import { validateAndGetEnv } from "@/infra/env.js";
import {
  cors,
  createCorsOptions,
  globalRateLimiter,
} from "@/middlewares/security.middleware.js";

const env = validateAndGetEnv();
const app = express();
const PORT = env.PORT;

app.disable("x-powered-by");
app.use(helmet());
app.use(cors(createCorsOptions(env.CORS_ALLOWED_ORIGINS, env.NODE_ENV === "production")));
app.use(globalRateLimiter);
app.use(express.json({ limit: env.JSON_LIMIT }));

app.use("/", appRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info("API Core rodando", { port: PORT });
});
