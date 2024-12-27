import { Router } from "express";
import {

  forgotPassword,
  getAllEnrolledCourseProgress,
  LoadProgress,
  Login,
  Logout,
  registerUser,
  Resetpassword,
  verifyuser,
} from "../controller/user.controller";
import upload from "../middleware/multer.middleware";
import { isAuthenticated } from "../middleware/auth.middleware";


const userRouter = Router();
userRouter.post("/register", upload.single("profileUrl"), registerUser); //marked
userRouter.post("/verify-code", verifyuser); //marked
userRouter.post("/sign-in", Login); //marked
userRouter.post("/logout", Logout); //marked
userRouter.post("/forgot-password", forgotPassword); //marked
userRouter.put("/reset-password/:token", Resetpassword); //marked

userRouter.get(
  "/enrolledcourse/progress/:courseId",
  isAuthenticated,
  LoadProgress
);
userRouter.get(
  "/enrolled/progress",
  isAuthenticated,
  getAllEnrolledCourseProgress
);

export default userRouter;
