"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = __importDefault(require("../controller/product.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const productRouter = (0, express_1.Router)();
productRouter.post("/add-product", auth_middleware_1.isAuthenticated, (0, auth_middleware_1.authorization)(["admin"]), product_controller_1.default.addProduct);
productRouter.put("/update-product/:productId", auth_middleware_1.isAuthenticated, (0, auth_middleware_1.authorization)(["admin"]), product_controller_1.default.UpdateProducts);
productRouter.delete("/delete-product/:productId", auth_middleware_1.isAuthenticated, (0, auth_middleware_1.authorization)(["admin"]), product_controller_1.default.deleteProduct);
productRouter.get("/search-product", product_controller_1.default.getProducts);
productRouter.get("/get-products", product_controller_1.default.getproductsbypagination);
productRouter.post("/increament-views/:productId", product_controller_1.default.increamentClicks);
productRouter.get("/product/:productId", product_controller_1.default.getProductById);
exports.default = productRouter;
