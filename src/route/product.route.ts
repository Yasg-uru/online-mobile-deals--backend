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
  "/update-product/:productId",
  isAuthenticated,
  authorization(["admin"]),
  ProductController.UpdateProducts
);
productRouter.delete(
  "/delete-product/:productId",
  isAuthenticated,
  authorization(["admin"]),
  ProductController.deleteProduct
);
productRouter.get("/search-product", ProductController.getProducts);
productRouter.get("/get-products", ProductController.getproductsbypagination);
productRouter.post("/increament-views/:productId", ProductController.increamentClicks);
export default productRouter;
