"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.getuserByToken = exports.Resetpassword = exports.forgotPassword = exports.Logout = exports.Login = exports.verifyuser = exports.registerUser = void 0;
const catchasync_middleware_1 = __importDefault(require("../middleware/catchasync.middleware"));
const usermodel_1 = __importDefault(require("../models/usermodel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const sendmail_util_1 = __importStar(require("../util/sendmail.util"));
const cloudinary_util_1 = __importDefault(require("../util/cloudinary.util"));
const Errorhandler_util_1 = __importDefault(require("../util/Errorhandler.util"));
const sendtoken_1 = __importDefault(require("../util/sendtoken"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.registerUser = (0, catchasync_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        console.log("this is a req.body", req.body);
        const ExistingUser = yield usermodel_1.default.findOne({
            email,
            isVerified: true,
        });
        if (ExistingUser) {
            return next(new Errorhandler_util_1.default(400, "already user exist"));
        }
        const ExistingUserUnVerified = yield usermodel_1.default.findOne({
            email,
            isVerified: false,
        });
        let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        if (ExistingUserUnVerified) {
            ExistingUserUnVerified.password = yield bcrypt_1.default.hash(password, 10);
            ExistingUserUnVerified.verifyCode = verifyCode;
            ExistingUserUnVerified.verifyCodeExpiry = new Date(Date.now() + 3600000);
            yield ExistingUserUnVerified.save();
            const emailResponse = yield (0, sendmail_util_1.default)(username, email, verifyCode);
            if (!emailResponse.success) {
                return next(new Errorhandler_util_1.default(400, emailResponse.message));
            }
        }
        else {
            const verifyCodeExpiry = new Date(Date.now() + 3600000);
            if (req.file && req.file.path) {
                const cloudinaryUrl = yield (0, cloudinary_util_1.default)(req.file.path);
                const profileUrl = cloudinaryUrl === null || cloudinaryUrl === void 0 ? void 0 : cloudinaryUrl.secure_url;
                console.log("this is a cloudinary and secure url", profileUrl + "     " + cloudinaryUrl);
                const newUser = new usermodel_1.default({
                    username,
                    password,
                    email,
                    profileUrl: profileUrl,
                    verifyCode: verifyCode,
                    verifyCodeExpiry: verifyCodeExpiry,
                    isVerified: false,
                });
                yield newUser.save();
            }
            else {
                const newUser = new usermodel_1.default({
                    username,
                    password,
                    email,
                    verifyCode: verifyCode,
                    verifyCodeExpiry: verifyCodeExpiry,
                    isVerified: false,
                });
                yield newUser.save();
            }
            const emailResponse = yield (0, sendmail_util_1.default)(username, email, verifyCode);
            if (!emailResponse.success) {
                return next(new Errorhandler_util_1.default(400, emailResponse.message));
            }
        }
        res.status(201).json({
            success: true,
            message: "User registered successfully ,please verify your account first",
        });
    }
    catch (error) {
        return next(new Errorhandler_util_1.default(500, "Internal server Error "));
    }
}));
exports.verifyuser = (0, catchasync_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, code } = req.body;
        const user = yield usermodel_1.default.findOne({ email });
        if (!user) {
            return next(new Errorhandler_util_1.default(404, "user not found with this email"));
        }
        const isValidCode = user.verifyCode === code;
        const isNotCodeExpired = new Date(user.verifyCodeExpiry) > new Date();
        if (isValidCode && isNotCodeExpired) {
            user.isVerified = true;
            yield user.save();
            res.status(200).json({
                success: true,
                message: "your account has been successfully verified",
            });
        }
        else if (!isNotCodeExpired) {
            return next(new Errorhandler_util_1.default(404, "Verification code has expired. Please sign up again to get a new code."));
        }
        else {
            return next(new Errorhandler_util_1.default(404, "Incorrect verification code . please signup again to get a new code"));
        }
    }
    catch (error) {
        return next(new Errorhandler_util_1.default(404, error));
    }
}));
exports.Login = (0, catchasync_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        console.log("this is a req.body:", req.body);
        if (!email || !password) {
            return next(new Errorhandler_util_1.default(404, "Please Enter credentials"));
        }
        const user = yield usermodel_1.default.findOne({ email });
        if (!user) {
            return next(new Errorhandler_util_1.default(404, "Invalid credentials"));
        }
        if (!user.isVerified) {
            return next(new Errorhandler_util_1.default(400, "Access denied, Please verify your account first "));
        }
        const isCorrectPassword = yield user.comparePassword(password);
        if (!isCorrectPassword) {
            return next(new Errorhandler_util_1.default(404, "Invalid credentials"));
        }
        const token = user.generateToken();
        (0, sendtoken_1.default)(res, token, 200, user);
    }
    catch (error) {
        console.log("Error Login", error);
        return next(new Errorhandler_util_1.default(500, "Internal server Error "));
    }
}));
exports.Logout = (0, catchasync_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res
        .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: false,
        sameSite: "none",
        secure: true,
    })
        .status(200)
        .json({
        success: true,
        message: "Logged out successfully",
    });
}));
exports.forgotPassword = (0, catchasync_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield usermodel_1.default.findOne({ email });
        if (!user) {
            return next(new Errorhandler_util_1.default(404, "User not found"));
        }
        user.ResetToken();
        yield user.save();
        const resetUrl = `http://localhost:5173/reset-password/${user.ResetPasswordToken}`;
        const mailresponse = yield (0, sendmail_util_1.sendResetPasswordMail)(resetUrl, email);
        if (!mailresponse.success) {
            return next(new Errorhandler_util_1.default(403, mailresponse.message));
        }
        res.status(200).json({
            success: true,
            message: "sent forgot password email successfully",
        });
    }
    catch (error) {
        return next(new Errorhandler_util_1.default(500, "Error forgot password"));
    }
}));
exports.Resetpassword = (0, catchasync_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { password } = req.body;
        //finding the user by this resettoken
        const user = yield usermodel_1.default.findOne({
            ResetPasswordToken: token,
            ResetPasswordTokenExpire: { $gt: new Date() },
        });
        if (!user) {
            return next(new Errorhandler_util_1.default(404, "Resetpassword token has been expired"));
        }
        user.password = password;
        user.ResetPasswordToken = undefined;
        user.ResetPasswordTokenExpire = undefined;
        yield user.save();
        res.status(200).json({
            success: true,
            message: "your reset password successfully",
        });
    }
    catch (error) {
        return next(new Errorhandler_util_1.default(500, "Error password Reset"));
    }
}));
exports.getuserByToken = (0, catchasync_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const decodedData = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield usermodel_1.default.findById(decodedData.id);
        if (!user) {
            return next(new Errorhandler_util_1.default(404, "please login to continue"));
        }
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        next(new Errorhandler_util_1.default(500, "Internal server Error"));
    }
}));
