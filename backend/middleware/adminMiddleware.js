const User = require("../models/user");

const admin = async (req, res, next) => {
    try {
        // التأكد إن المستخدم مسجل دخول
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Not authorized"
            });
        }

        // جلب المستخدم من قاعدة البيانات
        const user = await User.findById(req.user.id)
            .select("name email role");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // التأكد إن المستخدم Admin
        if (user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });
        }

        // حفظ بيانات المستخدم في الطلب
        req.user.role = user.role;
        req.user.name = user.name;
        req.user.email = user.email;

        next();

    } catch (error) {
        console.error("Admin middleware error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = admin;