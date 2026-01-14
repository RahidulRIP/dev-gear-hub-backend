const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;
const DATA_PATH = path.join(__dirname, "items.json");

// --- MIDDLEWARE ---
app.use(
  cors({
    origin: "https://dev-gear-hub-backend.onrender.com/",
    methods: ["Get", "Post"],
    credentials: true,
  })
);
app.use(express.json());

// --- HELPER FUNCTIONS ---

const readItems = () => {
  try {
    const data = fs.readFileSync(DATA_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading file:", error);
    return [];
  }
};

const writeItems = (items) => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(items, null, 2));
  } catch (error) {
    console.error("Error writing file:", error);
  }
};

// --- API ROUTES ---

// ১. বেসিক চেক
app.get("/", (req, res) => {
  res.send("🚀 DevGear Hub API is running with advanced data structure!");
});

// ২. সব আইটেম লিস্ট পাওয়ার রুট (GET All Items)
app.get("/api/items", (req, res) => {
  const items = readItems();
  res.json(items);
});

// ৩. নির্দিষ্ট আইডি দিয়ে একটি আইটেম দেখা (GET Single Item)
app.get("/api/items/:id", (req, res) => {
  const items = readItems();
  const item = items.find((i) => i.id === parseInt(req.params.id));

  if (!item) {
    return res.status(404).json({ message: "Item not found!" });
  }
  res.json(item);
});

// ৪. নতুন বিস্তারিত তথ্যসহ আইটেম অ্যাড করা (POST Add Item)
app.post("/api/items", (req, res) => {
  const items = readItems();

  // অনেক বেশি তথ্য রিসিভ করা হচ্ছে
  const { name, price, description, image, category, brand, stock, rating } =
    req.body;

  const newItem = {
    id: Date.now(),
    name,
    price: Number(price),
    description,
    image,
    category: category || "General",
    brand: brand || "Unknown",
    stock: Number(stock) || 0,
    rating: Number(rating) || 0,
    createdAt: new Date().toISOString(),
  };

  items.push(newItem);
  writeItems(items);

  res.status(201).json({ message: "Item added successfully!", item: newItem });
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`✅ Server is live at http://localhost:${PORT}`);
});
