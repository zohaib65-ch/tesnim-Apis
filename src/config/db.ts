import mongoose from "mongoose";
import config from "./index";
import { logger } from "../utils/logger";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Handle MongoDB connection events
    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected, trying to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
    });

    // Handle application termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    logger.error(
      `Error connecting to MongoDB: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    process.exit(1);
  }
};
