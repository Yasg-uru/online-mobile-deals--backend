"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const product_model_1 = require("../models/product.model");
const Errorhandler_util_1 = __importDefault(require("../util/Errorhandler.util"));
class ProductController {
    static addProduct(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Extract product details from the request body
                const { title, description, price, discount, category, source, affiliateLink, images, ratings, } = req.body;
                // Create a new product instance
                const newProduct = new product_model_1.Product({
                    title,
                    description,
                    price,
                    discount,
                    category,
                    source,
                    affiliateLink,
                    images,
                    ratings,
                    addedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                });
                // Save the product to the database
                const savedProduct = yield newProduct.save();
                // Send success response
                res.status(201).json({
                    message: "Product added successfully!",
                    product: savedProduct,
                });
            }
            catch (error) {
                console.error("Error adding product:", error);
                next(new Errorhandler_util_1.default(500, "Internal server Error "));
            }
        });
    }
    static UpdateProducts(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                const updateData = req.body;
                if (!productId) {
                    return next(new Errorhandler_util_1.default(400, "Product Id is required"));
                }
                const product = yield product_model_1.Product.findById(productId);
                if (!product) {
                    return next(new Errorhandler_util_1.default(404, "Product not found"));
                }
                Object.keys(updateData).forEach((key) => {
                    product[key] = updateData[key];
                });
                const updatedProduct = yield product.save();
                res.status(200).json({
                    message: "Product updated successfully",
                    product: updatedProduct,
                });
            }
            catch (error) {
                next(new Errorhandler_util_1.default(500, "Internal server error"));
            }
        });
    }
    static deleteProduct(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                const product = yield product_model_1.Product.findByIdAndDelete(productId);
                if (!product) {
                    return next(new Errorhandler_util_1.default(404, "Product not found"));
                }
                res.status(200).json({
                    message: "Product deleted successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getProducts(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { category, source, keywords } = req.query;
                const filterConditions = {};
                if (category)
                    filterConditions.category = category;
                if (source)
                    filterConditions.source = source;
                const products = yield product_model_1.Product.find(filterConditions);
                res.status(200).json(products);
            }
            catch (error) {
                next(error);
            }
        });
    }
    static getproductsbypagination(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Extract query parameters
                const { page = 1, limit = 10, category, search, sortBy = "createdAt", order = "desc", } = req.query;
                // Convert pagination parameters to numbers
                const pageNumber = Number(page);
                const limitNumber = Number(limit);
                // Build the query object
                const query = {};
                if (category && category !== "all") {
                    query.category = category;
                }
                if (search) {
                    query.$text = { $search: search };
                }
                // Calculate pagination parameters
                const skip = (pageNumber - 1) * limitNumber;
                // Fetch paginated products and we cant able
                const products = yield product_model_1.Product.find(query)
                    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
                    .skip(skip)
                    .limit(limitNumber);
                // Get total count for pagination metadata
                const total = yield product_model_1.Product.countDocuments(query);
                // Return response
                res.status(200).json({
                    success: true,
                    data: products,
                    meta: {
                        currentPage: pageNumber,
                        totalPages: Math.ceil(total / limitNumber),
                        totalItems: total,
                    },
                });
            }
            catch (error) {
                res.status(500).json({ success: false, message: "Server Error", error });
            }
        });
    }
    static increamentClicks(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId } = req.params;
                const product = yield product_model_1.Product.findById(productId);
                if (!product)
                    return next(new Errorhandler_util_1.default(404, "Product not found"));
                yield product.incrementClicks();
                res.status(200).json({ message: "Clicks incremented" });
            }
            catch (error) {
                next(new Errorhandler_util_1.default(500, "Internal server error"));
            }
        });
    }
}
exports.default = ProductController;
