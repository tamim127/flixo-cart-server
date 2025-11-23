const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb"); // ObjectId এখানে import করা হলো

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const uri =
    "mongodb+srv://flixo-cart:zGtuHph7q48GUzDW@cluster0.vormdea.mongodb.net/flixoDB?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // 1. MongoDB Connect
        await client.connect();

        const db = client.db("flixo-cart");
        const productsCollection = db.collection("products");
      
        //  Read Operations 
        app.get('/', (req, res) => {
            res.send("Server is running")
        });

        app.get('/products', async (req, res) => {
            const limit = parseInt(req.query.limit) || 24; 
            const skip = parseInt(req.query.skip) || 0;    
            try {
                const totalProducts = await productsCollection.countDocuments({});
                const cursor = productsCollection.find({})
                    .skip(skip)   
                    .limit(limit); 
                const result = await cursor.toArray();
                res.send({
                    products: result,
                    total: totalProducts,
                    limit: limit,
                    skip: skip
                });

            } catch (error) {
                console.error("Error fetching paginated products:", error);
                res.status(500).send({ message: "Failed to fetch products" });
            }
        });

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


        // ------------------------------------------------------------------
        // ---  CRUD Operations ---
        // ------------------------------------------------------------------

        // Add Product(C: Create)

        app.post('/products', async (req, res) => {
           
            const newProduct = req.body;
            try {
                const result = await productsCollection.insertOne(newProduct);
                
                res.status(201).send({ message: "Product added successfully", insertedId: result.insertedId });
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Failed to add product" });
            }
        });

        //  Update Product(U: Update)

        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedData = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: updatedData,
            };

            try {
                const result = await productsCollection.updateOne(filter, updateDoc);

                if (result.matchedCount === 0) {
                    return res.status(404).send({ message: "Product not found" });
                }
                res.send({ message: "Product updated successfully", modifiedCount: result.modifiedCount });
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Failed to update product" });
            }
        });

        //  Delete Product(D: Delete)

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            try {
                const result = await productsCollection.deleteOne(query);

                if (result.deletedCount === 1) {
                    res.send({ message: "Product deleted successfully" });
                } else {
                    res.status(404).send({ message: "Product not found or already deleted" });
                }
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Failed to delete product" });
            }
        });

   

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});