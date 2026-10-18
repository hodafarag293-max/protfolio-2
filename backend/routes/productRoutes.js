const express = require("express");

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

// عرض كل المنتجات (متاح للجميع)
router.get("/", getProducts);

// عرض منتج واحد (متاح للجميع)
router.get("/:id", getProductById);

// إنشاء منتج (Admin فقط)
router.post("/", protect, admin, createProduct);

// تعديل منتج (Admin فقط)
router.put("/:id", protect, admin, updateProduct);

// حذف منتج (Admin فقط)
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;