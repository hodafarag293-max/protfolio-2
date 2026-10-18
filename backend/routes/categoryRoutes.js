const express = require("express");

const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

// عرض كل التصنيفات
router.get("/", getCategories);

// عرض تصنيف واحد
router.get("/:id", getCategoryById);

// إنشاء تصنيف - Admin فقط
router.post("/", protect, admin, createCategory);

// تعديل تصنيف - Admin فقط
router.put("/:id", protect, admin, updateCategory);

// حذف تصنيف - Admin فقط
router.delete("/:id", protect, admin, deleteCategory);

module.exports = router;