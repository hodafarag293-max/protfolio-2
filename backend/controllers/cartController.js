const mongoose = require("mongoose");
const Cart = require("../models/cart");
const Product = require("../models/product");

const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id })
            .populate({
                path: "items.product",
                select: "name price image stock isActive"
            });

        if (!cart) {
            cart = await Cart.create({
                user: req.user.id,
                items: []
            });

            cart = await Cart.findById(cart._id).populate({
                path: "items.product",
                select: "name price image stock isActive"
            });
        }

        const items = cart.items
            .filter(item => item.product && item.product.isActive)
            .map(item => ({
                product: item.product,
                quantity: item.quantity,
                subtotal: item.product.price * item.quantity
            }));

        const total = items.reduce(
            (sum, item) => sum + item.subtotal,
            0
        );

        res.status(200).json({
            success: true,
            items,
            totalItems: items.reduce(
                (sum, item) => sum + item.quantity,
                0
            ),
            total: Number(total.toFixed(2))
        });
    } catch (error) {
        console.error("Get cart error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const quantity = req.body.quantity === undefined
            ? 1
            : Number(req.body.quantity);

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
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

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Not enough stock available"
            });
        }

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = new Cart({
                user: req.user.id,
                items: []
            });
        }

        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {
            if (existingItem.quantity + quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: "Requested quantity exceeds available stock"
                });
            }

            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity
            });
        }

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Product added to cart successfully"
        });
    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const quantity = Number(req.body.quantity);

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
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

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Not enough stock available"
            });
        }

        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const item = cart.items.find(
            entry => entry.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product is not in the cart"
            });
        }

        item.quantity = quantity;
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully"
        });
    } catch (error) {
        console.error("Update cart error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const originalLength = cart.items.length;

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        if (cart.items.length === originalLength) {
            return res.status(404).json({
                success: false,
                message: "Product is not in the cart"
            });
        }

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Product removed from cart successfully"
        });
    } catch (error) {
        console.error("Remove from cart error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const clearCart = async (req, res) => {
    try {
        await Cart.findOneAndUpdate(
            { user: req.user.id },
            { $set: { items: [] } }
        );

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully"
        });
    } catch (error) {
        console.error("Clear cart error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};