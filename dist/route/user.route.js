"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controller/user.controller");
const multer_middleware_1 = __importDefault(require("../middleware/multer.middleware"));
const userRouter = (0, express_1.Router)();
userRouter.post("/register", multer_middleware_1.default.single("profileUrl"), user_controller_1.registerUser);
userRouter.post("/verify-code", user_controller_1.verifyuser);
userRouter.post("/sign-in", user_controller_1.Login);
userRouter.post("/logout", user_controller_1.Logout);
userRouter.post("/forgot-password", user_controller_1.forgotPassword);
userRouter.put("/reset-password/:token", user_controller_1.Resetpassword);
userRouter.get("/me/:token", user_controller_1.getuserByToken);
exports.default = userRouter;
