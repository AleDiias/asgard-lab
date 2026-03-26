import express from "express";
import helmet from "helmet";
import { authRoutes } from "@/routes.js";
import { errorHandler } from "@/middlewares/error-handler.middleware.js";
import { logger } from "@/infra/logger.js";
import { validateAndGetEnv } from "@/infra/env.js";
import {
  cors,
  createCorsOptions,
  forgotPasswordRateLimiter,
  globalRateLimiter,
  loginRateLimiter,
  resetPasswordRateLimiter,
} from "@/middlewares/security.middleware.js";

const env = validateAndGetEnv();
const app = express();
const PORT = env.PORT;

app.disable("x-powered-by");
if (env.TRUST_PROXY) {
  // Necessário atrás de proxy (Caddy/Nginx) para rate-limit ler IP real com X-Forwarded-For.
  app.set("trust proxy", 1);
}
app.use(helmet());
app.use(cors(createCorsOptions(env.CORS_ALLOWED_ORIGINS, env.NODE_ENV === "production")));
app.use(globalRateLimiter);
app.use("/login", loginRateLimiter);
app.use("/forgot-password", forgotPasswordRateLimiter);
app.use("/reset-password", resetPasswordRateLimiter);
app.use(express.json({ limit: env.JSON_LIMIT }));

app.use("/", authRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info("API Auth rodando", { port: PORT });
});
