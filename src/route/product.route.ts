import { Router } from "express";
import ProductController from "../controller/product.controller";
import { authorization, isAuthenticated } from "../middleware/auth.middleware";
const productRouter = Router();
productRouter.post(
  "/add-product",
  isAuthenticated,
  authorization(["admin"]),
  ProductController.addProduct
);
productRouter.put(
  "/update-product",
  isAuthenticated,
  authorization(["admin"]),
  ProductController.UpdateProducts
);
productRouter.delete(
  "/delete-product",
  isAuthenticated,
  authorization(["admin"]),
  ProductController.deleteProduct
);
productRouter.get("/search-product", ProductController.getProducts);
productRouter.get("/increament-views", ProductController.increamentClicks);
export default productRouter;
