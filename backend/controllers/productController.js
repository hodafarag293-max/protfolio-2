const Product = require("../models/product");
const Category = require("../models/category");

// ==================== CREATE PRODUCT ====================
const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            image,
            stock
        } = req.body;

        if (
            !name ||
            !description ||
            price === undefined ||
            !category
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, description, price and category ID are required"
            });
        }

        if (!Number.isFinite(Number(price)) || Number(price) < 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a valid non-negative number"
            });
        }

        if (
            stock !== undefined &&
            (!Number.isFinite(Number(stock)) || Number(stock) < 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a valid non-negative number"
            });
        }

        if (!/^[a-fA-F0-9]{24}$/.test(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const existingCategory = await Category.findOne({
            _id: category,
            isActive: true
        });

        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Active category not found"
            });
        }

        const product = await Product.create({
            name,
            description,
            price: Number(price),
            category,
            image: image || "",
            stock: stock === undefined ? 0 : Number(stock),
            createdBy: req.user.id
        });

        await product.populate("category", "name description");

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });

    } catch (error) {
        console.error("Create product error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// ==================== GET ALL PRODUCTS ====================
const getProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            sort,
            page = 1,
            limit = 10
        } = req.query;

        const pageNumber = Math.max(1, parseInt(page, 10) || 1);
        const limitNumber = Math.min(
            100,
            Math.max(1, parseInt(limit, 10) || 10)
        );

        const filter = { isActive: true };

        if (search) {
            filter.name = {
                $regex: search,
                $options: "i"
            };
        }

        if (category) {
            if (!/^[a-fA-F0-9]{24}$/.test(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID"
                });
            }

            filter.category = category;
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            const min = minPrice === undefined ? undefined : Number(minPrice);
            const max = maxPrice === undefined ? undefined : Number(maxPrice);

            if (
                (min !== undefined && (!Number.isFinite(min) || min < 0)) ||
                (max !== undefined && (!Number.isFinite(max) || max < 0)) ||
                (min !== undefined && max !== undefined && min > max)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid price range"
                });
            }

            filter.price = {};
            if (min !== undefined) filter.price.$gte = min;
            if (max !== undefined) filter.price.$lte = max;
        }

        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            name_asc: { name: 1 },
            name_desc: { name: -1 }
        };

        const sortBy = sortOptions[sort] || sortOptions.newest;

        const totalProducts = await Product.countDocuments(filter);

        const products = await Product.find(filter)
            .populate("category", "name description")
            .populate("createdBy", "name email")
            .sort(sortBy)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        res.status(200).json({
            success: true,
            count: products.length,
            totalProducts,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalProducts / limitNumber),
            products
        });

    } catch (error) {
        console.error("Get products error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
// ==================== GET SINGLE PRODUCT ====================
const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            isActive: true
        })
            .populate("category", "name description")
            .populate("createdBy", "name email");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error("Get product error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// ==================== UPDATE PRODUCT ====================
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const {
            name,
            description,
            price,
            category,
            image,
            stock,
            isActive
        } = req.body;

        if (price !== undefined) {
            if (!Number.isFinite(Number(price)) || Number(price) < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Price must be a valid non-negative number"
                });
            }

            product.price = Number(price);
        }

        if (stock !== undefined) {
            if (!Number.isFinite(Number(stock)) || Number(stock) < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Stock must be a valid non-negative number"
                });
            }

            product.stock = Number(stock);
        }

        if (category !== undefined) {
            if (!/^[a-fA-F0-9]{24}$/.test(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID"
                });
            }

            const existingCategory = await Category.findOne({
                _id: category,
                isActive: true
            });

            if (!existingCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Active category not found"
                });
            }

            product.category = category;
        }

        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (image !== undefined) product.image = image;
        if (isActive !== undefined) product.isActive = isActive;

        await product.save();

        await product.populate("category", "name description");

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });

    } catch (error) {
        console.error("Update product error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// ==================== DELETE PRODUCT ====================
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        product.isActive = false;

        await product.save();

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Delete product error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};