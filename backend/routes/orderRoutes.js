const express = require("express");

const {
    createOrder,
    getMyOrders,
    getMyOrderById,
    getAllOrders,
    updateOrderStatus
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

// العميل
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/my-orders/:id", protect, getMyOrderById);

// الإدارة فقط
router.get("/admin/all", protect, admin, getAllOrders);
router.patch("/admin/:id/status", protect, admin, updateOrderStatus);

module.exports = router;