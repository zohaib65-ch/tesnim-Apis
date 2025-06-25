import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface Config {
  NODE_ENV: string;
  PORT: number;
  API_PREFIX: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string | undefined;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  SENDGRID_API_KEY: string;
  EMAIL_FROM: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_ID_PREMIUM: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
  LOG_LEVEL: string;
  CLIENT_URL: string;
}
const config: Config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,
  API_PREFIX: process.env.API_PREFIX || "/api/v1",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/minest",
  JWT_SECRET:
    process.env.JWT_SECRET || "your_fallback_secret_that_should_be_changed",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || "your_fallback_refresh_secret",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "no-reply@minest.app",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  STRIPE_PRICE_ID_PREMIUM: process.env.STRIPE_PRICE_ID_PREMIUM || "",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS
    ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10)
    : 15 * 60 * 1000,
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX
    ? parseInt(process.env.RATE_LIMIT_MAX, 10)
    : 100,
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
};
console.log(config);
export default config;
