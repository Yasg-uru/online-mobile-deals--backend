import { NextFunction, Request, Response } from "express";
import { Product } from "../models/product.model";
import Errorhandler from "../util/Errorhandler.util";
import { reqwithuser } from "../middleware/auth.middleware";

class ProductController {
  public static async addProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Extract product details from the request body
      const {
        title,
        description,
        price,
        discount,
        category,
        source,
        affiliateLink,
        images,
        ratings,
        keywords,
        addedBy,
      } = req.body;

      // Create a new product instance
      const newProduct = new Product({
        title,
        description,
        price,
        discount,
        category,
        source,
        affiliateLink,
        images,
        ratings,
        keywords,
        addedBy,
      });

      // Save the product to the database
      const savedProduct = await newProduct.save();

      // Send success response
      res.status(201).json({
        message: "Product added successfully!",
        product: savedProduct,
      });
    } catch (error) {
      console.error("Error adding product:", error);

      next(new Errorhandler(500, "Internal server Error "));
    }
  }
  public static async UpdateProducts(
    req: reqwithuser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productId } = req.params;
      const updateData = req.body;
      if (!productId) {
        return next(new Errorhandler(400, "Product Id is required"));
      }
      const product = await Product.findById(productId);
      if (!product) {
        return next(new Errorhandler(404, "Product not found"));
      }
      Object.keys(updateData).forEach((key) => {
        (product as any)[key] = updateData[key];
      });
      const updatedProduct = await product.save();
      res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct,
      });
    } catch (error) {
      next(new Errorhandler(500, "Internal server error"));
    }
  }
  public static async deleteProduct(
    req: reqwithuser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productId } = req.params;
      const product = await Product.findByIdAndDelete(productId);
      if (!product) {
        return next(new Errorhandler(404, "Product not found"));
      }
      res.status(200).json({
        message: "Product deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  public static async getProducts(
    req: reqwithuser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { category, source, keywords } = req.query;

      const filterConditions: any = {};

      if (category) filterConditions.category = category;
      if (source) filterConditions.source = source;
      if (keywords)
        filterConditions.keywords = { $in: (keywords as string).split(",") };

      const products = await Product.find(filterConditions);
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  }
  public static async increamentClicks(
    req: reqwithuser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productId } = req.params;

      const product = await Product.findById(productId);
      if (!product) return next(new Errorhandler(404, "Product not found"));

      await product.incrementClicks();
      res.status(200).json({ message: "Clicks incremented" });
    } catch (error) {
      next(new Errorhandler(500, "Internal server error"));
    }
  }
}

export default ProductController;
