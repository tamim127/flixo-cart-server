// ------------------------------
// server.js
// ------------------------------

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ Enable CORS for all origins
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Parse JSON bodies
app.use(express.json());

app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        return res.sendStatus(200);
    }
    next();
});

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vormdea.mongodb.net/flixoDB?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const db = client.db("flixo-cart");
        const productsCollection = db.collection("products");

        // -------------------------
        // Default Route
        // -------------------------
        app.get('/', (req, res) => res.send("Server is running"));

        // -------------------------
        // Products Pagination
        // -------------------------
        app.get('/products', async (req, res) => {
            const limit = parseInt(req.query.limit) || 24;
            const skip = parseInt(req.query.skip) || 0;

            try {
                const total = await productsCollection.countDocuments({});
                const products = await productsCollection.find({})
                    .skip(skip)
                    .limit(limit)
                    .toArray();

                res.send({ products, total, limit, skip });
            } catch (error) {
                res.status(500).send({ message: "Failed to fetch products" });
            }
        });

        // -------------------------
        // Single Product
        // -------------------------
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;

            if (!ObjectId.isValid(id)) return res.status(400).send({ message: "Invalid product ID" });

            const product = await productsCollection.findOne({ _id: new ObjectId(id) });
            if (!product) return res.status(404).send({ message: "Product not found" });

            res.send(product);
        });

        // -------------------------
        // Add Product
        // -------------------------
        app.post('/products', async (req, res) => {
            const product = { ...req.body, createdAt: new Date(), updatedAt: new Date() };
            try {
                const result = await productsCollection.insertOne(product);
                res.status(201).send({ message: "Product added successfully", insertedId: result.insertedId });
            } catch (error) {
                res.status(500).send({ message: "Failed to add product" });
            }
        });

        // -------------------------
        // Update Product
        // -------------------------
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedData = { ...req.body, updatedAt: new Date() };

            try {
                const result = await productsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedData });
                if (result.matchedCount === 0) return res.status(404).send({ message: "Product not found" });
                res.send({ message: "Product updated successfully" });
            } catch (error) {
                res.status(500).send({ message: "Failed to update product" });
            }
        });

        // -------------------------
        // Delete Product
        // -------------------------
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
                if (result.deletedCount === 0) return res.status(404).send({ message: "Product not found" });
                res.send({ message: "Product deleted successfully" });
            } catch (error) {
                res.status(500).send({ message: "Failed to delete product" });
            }
        });

        // -------------------------
        // Categories
        // -------------------------
        app.get('/categories', async (req, res) => {
            try {
                const categories = await productsCollection.distinct("category");
                res.send(categories);
            } catch (error) {
                res.status(500).send({ message: "Failed to load categories" });
            }
        });

        // -------------------------
        // Products by Category
        // -------------------------
        app.get('/products/category/:name', async (req, res) => {
            const category = req.params.name;
            const limit = parseInt(req.query.limit) || 24;
            const skip = parseInt(req.query.skip) || 0;

            try {
                const total = await productsCollection.countDocuments({ category });
                const products = await productsCollection.find({ category })
                    .skip(skip)
                    .limit(limit)
                    .toArray();

                res.send({ products, total, limit, skip });
            } catch (error) {
                res.status(500).send({ message: "Failed to fetch category products" });
            }
        });

        // -------------------------
        // Search Products
        // -------------------------
        app.get('/products/search', async (req, res) => {
            const q = req.query.q;
            if (!q) return res.status(400).send({ message: "Query required" });

            const filter = {
                $or: [
                    { title: { $regex: q, $options: "i" } },
                    { description: { $regex: q, $options: "i" } },
                    { tags: { $regex: q, $options: "i" } }
                ]
            };

            try {
                const result = await productsCollection.find(filter).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Search failed" });
            }
        });

        // -------------------------
        // Price Filter
        // -------------------------
        app.get('/products/filter', async (req, res) => {
            const min = parseFloat(req.query.minPrice) || 0;
            const max = parseFloat(req.query.maxPrice) || 999999;

            try {
                const result = await productsCollection.find({ price: { $gte: min, $lte: max } }).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Filtering failed" });
            }
        });

        // -------------------------
        // Brand Filter
        // -------------------------
        app.get('/products/brand/:brand', async (req, res) => {
            const brand = req.params.brand;
            try {
                const result = await productsCollection.find({ brand }).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Brand filter failed" });
            }
        });


        
        app.get("/my-products", async (req, res) => {
            try {
                const sellerId = req.query.sellerId;
                if (!sellerId) return res.status(400).json({ error: "Seller ID required" });

                // এখানে তুমি MongoDB collection use করছ
                const productsCollection = client.db("yourDB").collection("products");

                const products = await productsCollection
                    .find({ sellerId })  // filter by sellerId
                    .sort({ "meta.createdAt": -1 }) // latest first
                    .toArray();

                res.status(200).json(products);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: "Failed to fetch your products" });
            }
        });


        // -------------------------
        // Tag Filter
        // -------------------------
        app.get('/products/tags/:tag', async (req, res) => {
            const tag = req.params.tag;
            try {
                const result = await productsCollection.find({ tags: tag }).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Tag filter failed" });
            }
        });

        console.log("MongoDB Connected!");
    } finally { }
}

run().catch(console.dir);

app.listen(port, () => console.log(`Server running on port ${port}`));
