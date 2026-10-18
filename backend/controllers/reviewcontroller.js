
const mongoose = require("mongoose");
const Review = require("../models/review");
const Product = require("../models/product");

// إضافة تقييم جديد
const createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (
            rating === undefined ||
            !Number.isInteger(Number(rating)) ||
            Number(rating) < 1 ||
            Number(rating) > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer from 1 to 5"
            });
        }

        if (
            typeof comment !== "string" ||
            comment.trim().length < 3 ||
            comment.trim().length > 1000
        ) {
            return res.status(400).json({
                success: false,
                message: "Comment must be between 3 and 1000 characters"
            });
        }

        const product = await Product.findOne({
            _id: productId,
            isActive: true
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const review = await Review.create({
            product: productId,
            user: req.user.id,
            rating: Number(rating),
            comment: comment.trim()
        });

        return res.status(201).json({
            success: true,
            message: "Review created successfully",
            review
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "You have already reviewed this product"
            });
        }

        console.error("Create review error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// عرض مراجعات المنتج ومتوسط التقييم
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findOne({
            _id: productId,
            isActive: true
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const reviews = await Review.find({ product: productId })
            .populate("user", "name")
            .sort({ createdAt: -1 });

        const totalReviews = reviews.length;

        const averageRating = totalReviews
            ? Number(
                (
                    reviews.reduce(
                        (sum, review) => sum + review.rating,
                        0
                    ) / totalReviews
                ).toFixed(1)
            )
            : 0;

        return res.status(200).json({
            success: true,
            totalReviews,
            averageRating,
            reviews
        });
    } catch (error) {
        console.error("Get reviews error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    createReview,
    getProductReviews
};