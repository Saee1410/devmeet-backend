import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisConnection = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
    })
    : new Redis({
        host: "127.0.0.1",
        port: 6379,
        maxRetriesPerRequest: null,
    });

redisConnection.on("connect", () => {
    console.log("Redis Connected Successfully");
});

redisConnection.on("error", (err) => {
    console.error("Redis Connection Error:", err.message);
});

export default redisConnection;