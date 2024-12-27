import mongoose, { Document, Model, Schema } from "mongoose";

// Interface for the Product document
export interface IProduct extends Document {
  title: string;
  description?: string;
  price: number;
  discount: number;
  finalPrice: number;
  category:
    | "Electronics"
    | "Fashion"
    | "Home Appliances"
    | "Books"
    | "Beauty"
    | "Others";
  source: "string";
  affiliateLink: string;

  images: string[];
  ratings: {
    averageRating: number;
    totalRatings: number;
  };

  keywords: string[];
  clicks: number;
  addedBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;

  incrementClicks(): Promise<void>;
}

// Interface for the Product model with static methods
export interface IProductModel extends Model<IProduct> {
  getProductsBySource(source: "string"): Promise<IProduct[]>;
}

// Product Schema
const ProductSchema: Schema<IProduct> = new mongoose.Schema(
  {
    // Basic Product Information
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0, // Percentage discount
    },
    finalPrice: {
      type: Number,
      default: function () {
        // Auto-calculated final price after discount
        return this.price - (this.price * this.discount) / 100;
      },
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Electronics",
        "Fashion",
        "Home Appliances",
        "Books",
        "Beauty",
        "Others",
      ],
    },

    // Product Source Information
    source: {
      type: String,
      required: true,
    },
    affiliateLink: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => /^(http|https):\/\/[^ "]+$/.test(v),
        message: (props: { value: string }) =>
          `${props.value} is not a valid URL!`,
      },
    },

    // Metadata
    images: {
      type: [String], // Array of image URLs
      validate: {
        validator: (v: string[]) =>
          v.every((url) => /^(http|https):\/\/[^ "]+$/.test(url)),
        message: (props: { value: string[] }) =>
          `Some of the provided URLs are invalid!`,
      },
    },
    ratings: {
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalRatings: {
        type: Number,
        default: 0,
      },
    },

    // SEO and Analytics
    keywords: {
      type: [String], // Tags or keywords for search optimization
      default: [],
    },
    clicks: {
      type: Number,
      default: 0, // Number of times the product link has been clicked
    },

    // Admin Controls
    addedBy: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the admin user
      ref: "User",
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Middleware to recalculate final price before saving
ProductSchema.pre<IProduct>("save", function (next) {
  if (this.isModified("price") || this.isModified("discount")) {
    this.finalPrice = this.price - (this.price * this.discount) / 100;
  }
  next();
});

// Static Methods
ProductSchema.statics.getProductsBySource = async function (
  source: "string"
): Promise<IProduct[]> {
  return this.find({ source });
};

// Instance Methods
ProductSchema.methods.incrementClicks = async function (): Promise<void> {
  this.clicks += 1;
  await this.save();
};

// Index for Search Optimization
ProductSchema.index({ title: "text", description: "text", keywords: 1 });

// Export the model
export const Product: IProductModel = mongoose.model<IProduct, IProductModel>(
  "Product",
  ProductSchema
);
