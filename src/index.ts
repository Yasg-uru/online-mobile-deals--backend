import express from "express";
import cors from "cors";
import ConnectDatabase from "./lib/connectDb";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from "./route/user.route";

import { ErrorhandlerMiddleware } from "./util/Errorhandler.util";
import productRouter from "./route/product.route";
const app = express();

app.use(
  cors({
    origin: [
    
      "http://localhost:5173",
     "https://onlinemobiledealscom.vercel.app",
     'https://onlinemobiledeals-com-frontend.vercel.app',
     'https://onlinemobiledeals.com',
     'https://www.onlinemobiledeals.com'

    ], // The IP address where your Expo app is running
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/user", userRouter);
app.use("/product", productRouter);
app.use(ErrorhandlerMiddleware);

dotenv.config();
ConnectDatabase();
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("server is running on port:", PORT);
});
