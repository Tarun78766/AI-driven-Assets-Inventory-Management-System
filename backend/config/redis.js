const { createClient } = require("redis");
// Load dotenv here to ensure process.env is populated even if required before app.js call
require("dotenv").config();

const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

let hasLoggedError = false;

client.on("error", (err) => {
  if (!hasLoggedError) {
    console.error("[Redis] Connection error:", err.message);
    hasLoggedError = true;
  }
});

client.on("connect", () => {
  console.log("[Redis] Cache connected successfully.");
});

client.on("ready", () => {
  console.log("[Redis] Cache client ready and authenticated.");
  hasLoggedError = false;
});

client.on("reconnecting", () => {
  console.warn("[Redis] Attempting to reconnect...");
});

// Start connection in background
client.connect().catch((err) => {
  console.error("[Redis] Initial connection failed:", err.message);
});

/**
 * Safe caching wrapper that leverages node-redis offline queuing.
 */
const cacheData = async (key, value, expInSeconds = 3600) => {
  try {
    // value must be a string in redis v4+
    const serializedValue = JSON.stringify(value);
    
    // Use modern SET with EX option
    await client.set(key, serializedValue, {
      EX: expInSeconds
    });
    
    // console.log(`[Redis] Cached data for key: ${key}`); // Debug log
  } catch (err) {
    console.error(`[Redis] Failed to cache data for key: ${key}`, err.message);
  }
};

const getCachedData = async (key) => {
  try {
    const data = await client.get(key);
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (err) {
    console.error(`[Redis] Failed to retrieve data for key: ${key}`, err.message);
    return null;
  }
};

const invalidateCache = async (keyPattern) => {
  try {
    if (keyPattern.includes("*")) {
      const keys = await client.keys(keyPattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
    } else {
      await client.del(keyPattern);
    }
  } catch (err) {
    console.error(`[Redis] Failed to invalidate cache for pattern: ${keyPattern}`, err.message);
  }
};

module.exports = {
  client,
  cacheData,
  getCachedData,
  invalidateCache,
};
