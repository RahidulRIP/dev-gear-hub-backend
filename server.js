const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION SETTINGS ---
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    const database = client.db("devgear_db");
    const itemsCollection = database.collection("items");

    console.log("✅ Successfully connected to MongoDB!");

    app.get("/", (req, res) => {
      res.send("🚀 DevGear Hub API is running successfully!");
    });

    // --- API ROUTES ---

    //  (GET All Items)
    app.get("/api/items", async (req, res) => {
      const cursor = itemsCollection.find().sort({ createdAt: -1 });
      const items = await cursor.toArray();
      res.json(items);
    });

    //  (GET Single Item)
    app.get("/api/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const item = await itemsCollection.findOne(query);

      if (!item) return res.status(404).json({ message: "Item not found!" });
      res.json(item);
    });

    // (POST Add Item)
    app.post("/api/items", async (req, res) => {
      const newItem = {
        ...req.body,
        price: Number(req.body.price),
        stock: Number(req.body.stock),
        rating: Number(req.body.rating),
        createdAt: new Date(),
      };

      const result = await itemsCollection.insertOne(newItem);
      res.status(201).json({
        message: "Item added successfully!",
        insertedId: result.insertedId,
      });
    });

    app.get("/api/categories", async (req, res) => {
      try {
        const categories = await itemsCollection
          .aggregate([
            {
              $group: {
                _id: "$category", // ক্যাটাগরি অনুযায়ী গ্রুপ করা
                count: { $sum: 1 }, // প্রতিটি ক্যাটাগরিতে কয়টি আইটেম আছে গোনা
                image: { $first: "$image" }, // ওই ক্যাটাগরির প্রথম আইটেমের ইমেজ নেওয়া
              },
            },
          ])
          .toArray();

        res.send(categories);
      } catch (error) {
        res.status(500).send({ message: "Error fetching categories" });
      }
    });
  } finally {
    // client.close()
  }
}

run().catch(console.dir);

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`✅ Server is live at http://localhost:${PORT}`);
});
