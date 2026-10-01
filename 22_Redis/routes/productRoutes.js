const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} = require("../services/productServices.js");
const express = require("express");
const router = express.Router();
const { cache } = require("../middleware/cache.js");

router
    .route("/")
    .get(
        cache(() => "products:all", 60),
        async (req, res) => {
            const products = await getAllProducts();
            await redisClient.set(
                res.locals.cacheKey,
                JSON.stringify(products),
                {
                    EX: res.locals.cacheTTL,
                },
            );

            res.json({
                source: "database",
                data: products,
            });
        },
    )
    .post(async (req, res) => {
        const { name, price } = req.body;

        if (!name || price === undefined) {
            return res
                .status(400)
                .json({ message: "name and price are required" });
        }

        const product = await createProduct(name, Number(price));
        await redisClient.del("products:all");
        res.status(201).json({
            source: "database",
            data: product,
        });
    });

router
    .route("/:id")
    .get(
        cache((req) => `products:${req.params.id}`, 60),
        async (req, res) => {
            const id = Number(req.params.id);
            const product = await getProductById(id);
            if (!product) {
                return res.status(404).json({
                    message: "Product not found",
                });
            }
            await redisClient.set(
                res.locals.cacheKey,
                JSON.stringify(product),
                {
                    EX: res.locals.cacheTTL,
                },
            );

            res.json({
                source: "database",
                data: product,
            });
        },
    )
    .put(async (req, res) => {
        const id = Number(req.params.id);
        const { name, price } = req.body;

        if (!name || price === undefined) {
            return res
                .status(400)
                .json({ message: "name and price are required" });
        }

        const product = await updateProduct(id, name, Number(price));
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        await redisClient.del(`product:${id}`);
        await redisClient.del("products:all");
        res.json({
            source: "database",
            data: product,
        });
    })
    .delete(async (req, res) => {
        const id = Number(req.params.id);

        const deleted = await deleteProduct(id);
        if (!deleted) {
            return res.status(404).json({ message: "Product not found" });
        }

        await redisClient.del(`product:${id}`);
        await redisClient.del("products:all");

        res.json({
            message: "Product deleted",
        });
    });

module.exports = router;
