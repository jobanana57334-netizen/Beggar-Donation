import express from "express";
import { createRequire } from "module"; // 1. 引入建立 require 的功能
import "dotenv/config";

const require = createRequire(import.meta.url); // 2. 建立一個傳統的 require
const ecpay_aio_nodejs = require("ecpay_aio_nodejs"); // 3. 使用傳統方式載入套件

const router = express.Router();

router.post("/create-payment", (req, res) => {
  const { ECPAY_MERCHANT_ID, ECPAY_HASH_KEY, ECPAY_HASH_IV } = process.env;

  // SDK 執行完整的設定檔，包含 MercProfile、IgnorePayment 與 IsProjectContractor
  const options = {
    OperationMode: "Test",
    MercProfile: {
      MerchantID: String(ECPAY_MERCHANT_ID).trim(),
      HashKey: String(ECPAY_HASH_KEY).trim(),
      HashIV: String(ECPAY_HASH_IV).trim(),
    },
    IgnorePayment: [], // 陣列中若包含特定字串則隱藏該付款方式，可選項："Credit", "WebATM", "ATM", "CVS", "BARCODE", "AndroidPay"
    IsProjectContractor: false, // 是否為特約合作專案
  };

  console.log("🚀 使用 createRequire 模式與 MercProfile 結構發動訂單！");

  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "金額無效!" });
  }

  // 1. 先取得當下時間，並手動加 8 小時轉換為台灣時間 (UTC+8)
  const now = new Date();
  const twTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);

  // 2. 暴力拆解並強制補零 (padStart 會確保個位數前面加 0)
  const yyyy = twTime.getUTCFullYear();
  const mm = String(twTime.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(twTime.getUTCDate()).padStart(2, "0");
  const HH = String(twTime.getUTCHours()).padStart(2, "0");
  const MM = String(twTime.getUTCMinutes()).padStart(2, "0");
  const ss = String(twTime.getUTCSeconds()).padStart(2, "0");

  const formattedDate = `${yyyy}/${mm}/${dd} ${HH}:${MM}:${ss}`;

  const base_param = {
    MerchantTradeNo: `BG${Date.now()}`,
    MerchantTradeDate: formattedDate,
    TotalAmount: amount.toString(),
    TradeDesc: "愛心捐款給阿信",
    ItemName: "支持阿信脫離乞丐生活",
    ReturnURL: "https://beggar-donation.onrender.com/api/payment/return",
    ChoosePayment: "ALL",
    // ✅ 修改後：先讓綠界 POST 回你的後端
    OrderResultURL:
      "https://beggar-donation.onrender.com/api/payment/payment-result",
  };

  try {
    // 使用傳統 require 載入的建構子，參數就不會再弄丟了
    const create = new ecpay_aio_nodejs(options);
    const html = create.payment_client.aio_check_out_all(base_param);
    res.send(html);
  } catch (err) {
    console.error("❌ 依然報錯，詳細內容：", err);
    res.status(500).json({ error: "金流初始化失敗", detail: err.message });
  }
});

// ==========================================
// 付款結果回傳 (ReturnURL) 也要套用相同的設定
// ==========================================
router.post("/return", (req, res) => {
  const data = req.body;
  const { ECPAY_MERCHANT_ID, ECPAY_HASH_KEY, ECPAY_HASH_IV } = process.env;

  const options = {
    OperationMode: "Test",
    MercProfile: {
      MerchantID: String(ECPAY_MERCHANT_ID).trim(),
      HashKey: String(ECPAY_HASH_KEY).trim(),
      HashIV: String(ECPAY_HASH_IV).trim(),
    },
    IgnorePayment: [],
    IsProjectContractor: false,
  };

  try {
    const create = new ecpay_aio_nodejs(options);
    // ✅ 拔除舊的幽靈函式，改用與 payment-result 一樣的底層驗證邏輯
    const returnData = { ...data };
    const receivedMac = returnData.CheckMacValue;
    delete returnData.CheckMacValue;
    const calculatedMac =
      create.payment_client.helper.gen_chk_mac_value(returnData);
    const isValid = receivedMac === calculatedMac;

    if (isValid && data.RtnCode === "1") {
      // ⚠️ 綠界規定，背景背景對帳成功一定要回傳 "1|OK"，否則它會以為你沒收到，一直重發
      return res.send("1|OK");
    } else {
      console.log(`⚠️ [背景對帳] 驗證失敗或付款失敗。`);
      return res.send("0|Error");
    }
  } catch (err) {
    console.error("❌ 驗證過程發生錯誤", err);
    res.send("0|Error");
  }
});

router.post("/payment-result", (req, res) => {
  const data = req.body;
  // 記得要把環境變數拉進來
  const { ECPAY_MERCHANT_ID, ECPAY_HASH_KEY, ECPAY_HASH_IV } = process.env;

  // 1. 準備好驗證機器的設定檔
  const options = {
    OperationMode: "Test",
    MercProfile: {
      MerchantID: String(ECPAY_MERCHANT_ID).trim(),
      HashKey: String(ECPAY_HASH_KEY).trim(),
      HashIV: String(ECPAY_HASH_IV).trim(),
    },
    IgnorePayment: [],
    IsProjectContractor: false,
  };

  try {
    // 2. 組裝客運站專屬的驗證機器
    const create = new ecpay_aio_nodejs(options);
    // ==========================================
    // 3. 掃描客人口袋裡的紙條，確認防偽印章是不是綠界老大親自蓋的
    // ==========================================

    // (a) 先複製一份綠界回傳的資料，避免改到原始物件
    const returnData = { ...data };

    // (b) 取出客人帶來的防偽印章 (綠界傳來的 CheckMacValue)
    const receivedMac = returnData.CheckMacValue;

    // (c) ⚠️ 重要：計算前必須把 CheckMacValue 屬性從物件中拿掉！
    delete returnData.CheckMacValue;

    // (d) 呼叫官方底層函式，用我們手上的 HashKey/IV 重新算一次印章
    const calculatedMac =
      create.payment_client.helper.gen_chk_mac_value(returnData);

    // (e) 比對兩個印章是否一模一樣
    const isValid = receivedMac === calculatedMac;

    // ==========================================

    // 4. 嚴格把關：防偽印章是真的 (isValid) 且 確實付錢了 (RtnCode === "1")
    if (isValid && data.RtnCode === "1") {
      res.redirect("https://beggar-donation.vercel.app/thanks");
    } else {
      res.redirect("https://beggar-donation.vercel.app/payment-failed");
    }
  } catch (err) {
    // 萬一客運站的驗證機器當機，為了安全起見，一律當作失敗處理
    console.error("❌ 客運站驗證過程發生錯誤", err);
    res.redirect("https://beggar-donation.vercel.app/payment-failed");
  }
});

export default router;
