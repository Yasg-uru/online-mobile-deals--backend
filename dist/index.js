"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const connectDb_1 = __importDefault(require("./lib/connectDb"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_route_1 = __importDefault(require("./route/user.route"));
const Errorhandler_util_1 = require("./util/Errorhandler.util");
const product_route_1 = __importDefault(require("./route/product.route"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173",
        "https://onlinemobiledealscom.vercel.app"
    ], // The IP address where your Expo app is running
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use("/user", user_route_1.default);
app.use("/product", product_route_1.default);
app.use(Errorhandler_util_1.ErrorhandlerMiddleware);
dotenv_1.default.config();
(0, connectDb_1.default)();
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log("server is running on port:", PORT);
});
