import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Helper to determine if TLS is needed (e.g., if URL starts with rediss:// or you are on a cloud provider like Upstash)
const redisUrl = process.env.REDIS_URL || "";
const isTls = redisUrl.startsWith("rediss://");

const redisConfig = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  // If your cloud provider uses self-signed certs or requires TLS:
  ...(isTls || process.env.NODE_ENV === "production" ? {
    tls: {
      rejectUnauthorized: false
    }
  } : {}),
};

// If REDIS_URL is provided, ioredis parses it automatically, 
// but we pass our options object as the second argument.
const redisConnection = redisUrl 
  ? new Redis(redisUrl, redisConfig)
  : new Redis({
      host: "127.0.0.1",
      port: 6379,
      ...redisConfig,
    });

redisConnection.on("connect", () => {
    console.log("Redis Connected Successfully");
});

redisConnection.on("error", (err) => {
    console.error("Redis Connection Error:", err.message);
});

export default redisConnection;