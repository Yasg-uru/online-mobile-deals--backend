import { NextFunction, Request, Response } from "express";
import { Product } from "../models/product.model";
import Errorhandler from "../util/Errorhandler.util";
import { reqwithuser } from "../middleware/auth.middleware";

class ProductController {
  public static async addProduct(
    req: reqwithuser,
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

        addedBy: req.user?._id,
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

      const products = await Product.find(filterConditions);
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  }
  public static async getproductsbypagination(
    req: reqwithuser,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Extract query parameters
      const {
        page = 1,
        limit = 10,
        category,
        search,
        sortBy = "createdAt",
        order = "desc",
      } = req.query;

      // Convert pagination parameters to numbers
      const pageNumber = Number(page);
      const limitNumber = Number(limit);

      // Build the query object
      const query: any = {};

      if (category && category !== "all") {
        query.category = category;
      }

      if (search) {
        query.$text = { $search: search as string };
      }

      // Calculate pagination parameters
      const skip = (pageNumber - 1) * limitNumber;

      // Fetch paginated products and we cant able
      const products = await Product.find(query)
        .sort({ [sortBy as string]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limitNumber);

      // Get total count for pagination metadata
      const total = await Product.countDocuments(query);

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
    } catch (error) {
      res.status(500).json({ success: false, message: "Server Error", error });
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
  public static async getProductById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { productId } = req.params;
      const product = await Product.findById(productId);
      if (!product) {
        return next(new Errorhandler(404, "product not found"));
      }
      res.status(200).json({
        product,
      });
    } catch (error) {
      next(new Errorhandler(500, "internal server error"));
    }
  }
}

export default ProductController;
