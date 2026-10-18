const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");
const Cart = require("../models/cart");

// إنشاء طلب من السلة
const createOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { shippingAddress } = req.body;

        if (
            !shippingAddress ||
            !shippingAddress.fullName?.trim() ||
            !shippingAddress.phone?.trim() ||
            !shippingAddress.city?.trim() ||
            !shippingAddress.street?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Complete shipping address is required"
            });
        }

        let createdOrder;

        await session.withTransaction(async () => {
            const cart = await Cart.findOne({ user: req.user.id })
                .session(session);

            if (!cart || !cart.items || cart.items.length === 0) {
                const error = new Error("Your cart is empty");
                error.statusCode = 400;
                throw error;
            }

            const orderItems = [];
            let totalAmount = 0;

            for (const cartItem of cart.items) {
                const product = await Product.findOne({
                    _id: cartItem.product,
                    isActive: true
                }).session(session);

                if (!product) {
                    const error = new Error("A product in your cart is unavailable");
                    error.statusCode = 400;
                    throw error;
                }

                if (product.stock < cartItem.quantity) {
                    const error = new Error(
                        `Not enough stock for ${product.name}`
                    );
                    error.statusCode = 400;
                    throw error;
                }

                orderItems.push({
                    product: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: cartItem.quantity
                });

                totalAmount += product.price * cartItem.quantity;

                const stockUpdate = await Product.updateOne(
                    {
                        _id: product._id,
                        isActive: true,
                        stock: { $gte: cartItem.quantity }
                    },
                    {
                        $inc: { stock: -cartItem.quantity }
                    },
                    { session }
                );

                if (stockUpdate.modifiedCount !== 1) {
                    const error = new Error(
                        `Stock changed for ${product.name}; please try again`
                    );
                    error.statusCode = 409;
                    throw error;
                }
            }

            const orders = await Order.create(
                [{
                    user: req.user.id,
                    items: orderItems,
                    shippingAddress,
                    totalAmount,
                    paymentMethod: "cash",
                    paymentStatus: "pending",
                    status: "pending"
                }],
                { session }
            );

            createdOrder = orders[0];

            cart.items = [];
            await cart.save({ session });
        });

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: createdOrder
        });

    } catch (error) {
        console.error("Create order error:", error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Server error while creating order"
        });

    } finally {
        await session.endSession();
    }
};

// عرض طلبات المستخدم الحالي
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate("items.product", "name image")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("Get my orders error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// عرض طلب واحد يخص المستخدم الحالي
const getMyOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        }).populate("items.product", "name image");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid order ID"
        });
    }
};

// عرض جميع الطلبات للإدارة فقط
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("Get all orders error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// تغيير حالة الطلب للإدارة فقط
const updateOrderStatus = async (req, res) => {
    try {
        const allowedStatuses = [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
        ];

        const { status } = req.body;

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.status === "cancelled" || order.status === "delivered") {
            return res.status(400).json({
                success: false,
                message: "This order can no longer be updated"
            });
        }

        // لا نسمح بإلغاء الطلب بعد شحنه من خلال هذا المسار.
        if (status === "cancelled" && order.status === "shipped") {
            return res.status(400).json({
                success: false,
                message: "A shipped order cannot be cancelled here"
            });
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        console.error("Update order status error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getMyOrderById,
    getAllOrders,
    updateOrderStatus
};