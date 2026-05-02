const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

let hasLoggedError = false;

client.on("error", (err) => {
  if (!hasLoggedError) {
    console.warn("[Redis] Cache connection error. Proceeding without cache.");
    hasLoggedError = true;
  }
});

client.on("connect", () => {
  console.log("[Redis] Cache connected successfully.");
  hasLoggedError = false;
});

// Immediately try connecting in the background
client.connect().catch(() => {
  // Silence startup errors as they are handled by the error listener above
});

/**
 * Safe caching wrapper that degrades gracefully if Redis is down.
 */
const cacheData = async (key, value, expInSeconds = 3600) => {
  if (!client.isReady) return;
  try {
    await client.setEx(key, expInSeconds, JSON.stringify(value));
  } catch (err) {
    // Silent fail for cache errors to avoid breaking the main request
  }
};

const getCachedData = async (key) => {
  if (!client.isReady) return null;
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
};

const invalidateCache = async (keyPattern) => {
  if (!client.isReady) return;
  try {
    const keys = await client.keys(keyPattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (err) {
    // Silent fail
  }
};

module.exports = {
  client,
  cacheData,
  getCachedData,
  invalidateCache,
};
