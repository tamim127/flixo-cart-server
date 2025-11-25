const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000
require("dotenv").config();


app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // OPTIONS রিকোয়েস্টের জন্য তৎক্ষণাৎ রেসপন্স দাও
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    next();
});



app.use(cors());
app.use(express.json());

const uri =
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vormdea.mongodb.net/flixoDB?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();

        const db = client.db("flixo-cart");
        const productsCollection = db.collection("products");

        // ------------------------------------
        //   Default Route
        // ------------------------------------
        app.get('/', (req, res) => {
            res.send("Server is running");
        });

        // ------------------------------------
        //   Pagination Products
        // ------------------------------------
        app.get('/products', async (req, res) => {
            const limit = parseInt(req.query.limit) || 24;
            const skip = parseInt(req.query.skip) || 0;

            try {
                const totalProducts = await productsCollection.countDocuments({});
                const result = await productsCollection.find({})
                    .skip(skip)
                    .limit(limit)
                    .toArray();

                res.send({
                    products: result,
                    total: totalProducts,
                    limit,
                    skip
                });

            } catch (error) {
                res.status(500).send({ message: "Failed to fetch products" });
            }
        });

        // ------------------------------------
        //   Single Product
        // ------------------------------------
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;

            if (!ObjectId.isValid(id)) {
                return res.status(400).send({ message: "Invalid product ID" });
            }

            const product = await productsCollection.findOne({ _id: new ObjectId(id) });

            if (!product) {
                return res.status(404).send({ message: "Product Not Found" });
            }

            res.send(product);
        });

        // ------------------------------------
        //   ADD Product
        // ------------------------------------
        app.post('/products', async (req, res) => {
            const newProduct = req.body;

            try {
                const result = await productsCollection.insertOne(newProduct);
                res.status(201).send({ message: "Product added successfully", insertedId: result.insertedId });
            } catch (error) {
                res.status(500).send({ message: "Failed to add product" });
            }
        });

        // ------------------------------------
        //   UPDATE Product
        // ------------------------------------
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedData = req.body;

            try {
                const result = await productsCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updatedData }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).send({ message: "Product not found" });
                }

                res.send({ message: "Product updated successfully" });

            } catch (error) {
                res.status(500).send({ message: "Failed to update product" });
            }
        });

        // ------------------------------------
        //   DELETE Product
        // ------------------------------------
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;

            try {
                const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });

                if (result.deletedCount === 1) {
                    return res.send({ message: "Product deleted successfully" });
                }

                res.status(404).send({ message: "Product not found" });

            } catch (error) {
                res.status(500).send({ message: "Failed to delete product" });
            }
        });

        // ====================================================================
        // 🔥🔥🔥  EXTRA API BASED ON YOUR JSON STRUCTURE
        // ====================================================================

        // ------------------------------------
        //   1️⃣ Get All Categories (unique)
        // ------------------------------------
        app.get('/categories', async (req, res) => {
            try {
                const categories = await productsCollection.distinct("category");
                res.send(categories);
            } catch (e) {
                res.status(500).send({ message: "Failed to load categories" });
            }
        });

        // ------------------------------------
        //   2️⃣ Get Products by Category
        // ------------------------------------
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

                res.send({
                    products,
                    total,
                    limit,
                    skip
                });

            } catch (e) {
                res.status(500).send({ message: "Failed to fetch category products" });
            }
        });

        // ------------------------------------
        //   3️⃣ Search Products (title, description, tags)
        // ------------------------------------
        app.get('/products/search', async (req, res) => {
            const q = req.query.q;

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
            } catch (e) {
                res.status(500).send({ message: "Search failed" });
            }
        });

        // ------------------------------------
        //   4️⃣ Price Range Filter
        // ------------------------------------
        app.get('/products/filter', async (req, res) => {
            const min = parseFloat(req.query.minPrice) || 0;
            const max = parseFloat(req.query.maxPrice) || 999999;

            try {
                const result = await productsCollection.find({
                    price: { $gte: min, $lte: max }
                }).toArray();

                res.send(result);

            } catch (e) {
                res.status(500).send({ message: "Filtering failed" });
            }
        });

        // ------------------------------------
        //   5️⃣ Brand Filter
        // ------------------------------------
        app.get('/products/brand/:brand', async (req, res) => {
            const brand = req.params.brand;

            try {
                const result = await productsCollection.find({ brand }).toArray();
                res.send(result);
            } catch (e) {
                res.status(500).send({ message: "Brand filter failed" });
            }
        });

        // ------------------------------------
        //   6️⃣ Tag Filter
        // ------------------------------------
        app.get('/products/tags/:tag', async (req, res) => {
            const tag = req.params.tag;

            try {
                const result = await productsCollection.find({
                    tags: tag
                }).toArray();

                res.send(result);

            } catch (e) {
                res.status(500).send({ message: "Tag filter failed" });
            }
        });


        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment, MongoDB Connected!");

    } finally { }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
