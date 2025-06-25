import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import config from "./config";
import { errorMiddleware } from "./middleware/error.middleware";
import { connectDB } from "./config/db";
import { logger } from "./utils/logger";
import routes from "./routes";

const app: Express = express();
const PORT = config.PORT || 8000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Request Parsing
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// HTTP request logging using Morgan + Winston
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms", {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

// API Routes
app.use(config.API_PREFIX, routes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Error handling middleware
app.use(errorMiddleware);

// Start Server
app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${config.NODE_ENV} mode on port ${PORT}`);
  logger.info(`🔗 API Base URL: http://localhost:${PORT}${config.API_PREFIX}`);
});

export default app;
