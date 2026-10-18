const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const cartRoutes = require("./routes/cartRoutes");
const protect = require("./middleware/authMiddleware");
const admin = require("./middleware/adminMiddleware");
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== DATABASE ====================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("❌ MongoDB connection failed:");
        console.error(error.message);
    });

// ==================== ROUTES ====================

// Authentication
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
// Products
app.use("/api/products", productRoutes);

// Categories
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/cart", cartRoutes);
// ==================== PROTECTED TEST ====================

app.get("/api/protected", protect, (req, res) => {
    res.json({
        success: true,
        message: "Protected route accessed successfully 🔐",
        user: req.user
    });
});

// ==================== ADMIN TEST ====================

app.get("/api/admin-test", protect, admin, (req, res) => {
    res.json({
        success: true,
        message: "Welcome Admin 👑"
    });
});

// ==================== HOME ====================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Mahmoud Farg API is running 🚀"
    });
});

// ==================== HEALTH CHECK ====================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is working perfectly ✅"
    });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(
        `🚀 Server running on http://localhost:${PORT}`
    );
});