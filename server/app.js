import "dotenv/config"; // ⬅️ 絕對不能漏掉這行，且必須在最上面！
import express from "express";
import cors from "cors";
import paymentRoutes from "./Routes/payment.js";

const app = express();

// 允許跨網域請求 (讓你的 Vite 前端可以連過來)
app.use(cors());

// 解析 JSON 格式的請求本體
app.use(express.json());

// 關鍵：這行必加！解析綠界傳來的 Form Data
app.use(express.urlencoded({ extended: true }));

// 統一掛載金流路由
// 這意味著 payment.js 裡面的 "/create-payment"
// 會自動變成 "/api/payment/create-payment"
app.use("/api/payment", paymentRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 後端 API 已啟動：http://localhost:${PORT}`);
});
