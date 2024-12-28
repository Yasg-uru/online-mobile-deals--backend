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
exports.Product = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Product Schema
const ProductSchema = new mongoose_1.default.Schema({
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
            validator: (v) => /^(http|https):\/\/[^ "]+$/.test(v),
            message: (props) => `${props.value} is not a valid URL!`,
        },
    },
    // Metadata
    images: {
        type: [String], // Array of image URLs
        validate: {
            validator: (v) => v.every((url) => /^(http|https):\/\/[^ "]+$/.test(url)),
            message: (props) => `Some of the provided URLs are invalid!`,
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
    clicks: {
        type: Number,
        default: 0, // Number of times the product link has been clicked
    },
    // Admin Controls
    addedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId, // Reference to the admin user
        ref: "User",
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt
});
// Middleware to recalculate final price before saving
ProductSchema.pre("save", function (next) {
    if (this.isModified("price") || this.isModified("discount")) {
        this.finalPrice = this.price - (this.price * this.discount) / 100;
    }
    next();
});
// Static Methods
ProductSchema.statics.getProductsBySource = function (source) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.find({ source });
    });
};
// Instance Methods
ProductSchema.methods.incrementClicks = function () {
    return __awaiter(this, void 0, void 0, function* () {
        this.clicks += 1;
        yield this.save();
    });
};
// Index for Search Optimization
ProductSchema.index({ title: "text", description: "text" });
// Export the model
exports.Product = mongoose_1.default.model("Product", ProductSchema);
