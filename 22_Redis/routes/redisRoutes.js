const express = require("express");
const router = express.Router();
const redisClient = require("../redis/config");
const { getProductsFromDatabase } = require("../services/productServices.js");

router.get("/", async (req, res) => {
    const result = await redisClient.set("name", "Keshav", { NX: true });
    console.log(result);
    const name = await redisClient.get("name");
    res.json({ name });
});

router.get("/exists", async (req, res) => {
    const exists = await redisClient.exists("name");
    res.json({ exists });
});

router.get("/temp", async (req, res) => {
    await redisClient.set("temporary", "hello", { EX: 30 }); // expires after 30s
    const value = await redisClient.get("temporary");
    const ttl = await redisClient.ttl("temporary");
    console.log(value);
    console.log(ttl);
});

router.get("/delete", async (req, res) => {
    const deleted = await redisClient.del("name");
    res.json({ deleted });
});

router.get("/user", async (req, res) => {
    const user = {
        id: 102,
        name: "Keshav",
        role: "developer",
    };
    await redisClient.set("user:102", JSON.stringify(user));
    const data = await redisClient.get("user:102");
    res.json(JSON.parse(data));
});

router.get("/products", async (req, res) => {
    const cacheKey = "products:all";

    // 1. Check Redis
    const cachedProducts = await redisClient.get(cacheKey);
    if (cachedProducts) {
        console.log("CACHE HIT");
        return res.json({
            source: "redis",
            data: JSON.parse(cachedProducts),
        });
    }

    // 2. Cache miss
    console.log("CACHE MISS");
    const products = await getProductsFromDatabase();

    // 3. Store in Redis
    await redisClient.set(cacheKey, JSON.stringify(products), {
        EX: 60,
    });

    // 4. Return data
    res.json({
        source: "database",
        data: products,
    });
});

module.exports = router;
