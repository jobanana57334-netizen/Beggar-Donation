import { useState } from "react";
import { User } from "lucide-react";
import Swal from "sweetalert2";

import AXin from "../assets/A-MIN-Chen.png";
import HomeLess from "../assets/homeLess.png";
const Donation = () => {
  const [inputAmount, setInputAmount] = useState(0);

  const MinAmount = 0;
  const MaxAmount = 500;
  const handleInputChange = (e) => {
    let Value = Number(e.target.value);
    if (Value > MaxAmount) {
      Value = MaxAmount;
    } else if (Value < MinAmount) {
      Value = MinAmount;
    }
    setInputAmount(Value);
  };

  const submit = async () => {
    if (inputAmount <= 0) {
      Swal.fire({
        title: "捐款失敗 ! ( Donation Failed ! )",
        text: "請輸入有效的捐款金額 ( Please enter a valid donation amount )",
        icon: "error",
        confirmButtonText: "確定 ( OK )",
        confirmButtonColor: "#EF4444",
      });
      return;
    }

    // ⭐ 第一步的關鍵：把金額存入瀏覽器記憶體
    // 放在防呆檢查之後，打 API 之前。確保只有「正確的金額」才會被存起來。
    sessionStorage.setItem("donationAmount", inputAmount);

    try {
      // 2. 顯示讀取中（選配，增加體驗）
      Swal.fire({
        title: "正在處理捐款... ( Processing Donation... )",
        text: "正在導入至綠界金流頁面 ( Redirecting to ECPay... )",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // 3. 呼叫你的後端 API
      const response = await fetch(
        "http://localhost:3000/api/payment/create-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: inputAmount }),
        },
      );
      if (!response.ok)
        throw new Error("伺服器回應異常 ( Server responded with an error )");

      // 4. 重要：綠界回傳的是 HTML 字串，不是 JSON
      const htmlForm = await response.text();

      // 5. 執行跳轉：將 HTML 插入頁面並自動提交
      const container = document.createElement("div");
      container.innerHTML = htmlForm;
      document.body.appendChild(container);

      // 綠界 SDK 產生的 HTML 包含一個會自動 submit 的 script
      // 但手動觸發更保險
      const form = container.querySelector("form");
      if (form) {
        form.submit();
      }
    } catch (err) {
      console.error("捐款過程發生錯誤 ( Error during donation process )", err);
      Swal.fire({
        title: "捐款失敗 ! ( Donation Failed ! )",
        text: "請稍後再試 ( Please try again later )",
        icon: "error",
        confirmButtonText: "確定 ( OK )",
        confirmButtonColor: "#EF4444",
      });
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      {/* 手機外殼容器 */}
      <div className="w-full max-w-[375px] bg-[#F8F9FA] rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-white relative">
        {/* 頂部狀態欄 */}
        <div className="flex justify-between items-center p-6 pb-2">
          <h1 className="text-gray-700 font-bold text-lg">
            捐款中心 ( Donation Center )
          </h1>
        </div>

        {/* 主要卡片內容 */}
        <div className="p-4 overflow-y-auto max-h-187.5 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 space-y-4">
            {/* 村莊基金標題區 */}
            <div className="flex items-start shrink-0 justify-between">
              <div className="flex gap-3">
                <div className="w-12 h-12 flex-none bg-green-100 rounded-full flex items-center aspect-square justify-center overflow-hidden border-2 border-white shadow-sm">
                  <img
                    src={AXin}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg leading-tight">
                    陳阿信 ( A-Xin Chen)
                  </h2>
                  <p className="mt-1 text-xs text-gray-400 leading-tight">
                    救救貧苦人，讓愛被傳遞（Help the soul , spread the love.）
                  </p>
                </div>
              </div>
            </div>

            {/* 插畫區域 */}
            <div className="bg-emerald-50 rounded-2xl overflow-hidden aspect-[16/9] flex items-center justify-center relative">
              <img
                src={HomeLess}
                className="w-full h-full object-cover opacity-80"
                alt="Village illustration"
              />
            </div>

            {/* 餘額與選擇數值 */}
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-400 mb-1">
                  輸入捐款金額 ( Input Donation )
                </p>
                <div className="text-3xl font-bold text-emerald-900">
                  ${inputAmount}
                </div>
              </div>
            </div>

            {/* 自定義金額滑塊 */}
            <div className="space-y-3">
              {/* 金額顯示與輸入框 */}
              <div className="relative flex items-center">
                <span className="absolute left-4 text-xl font-bold text-emerald-600">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  max={MaxAmount}
                  value={inputAmount}
                  onChange={handleInputChange}
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-10 pr-4 text-2xl font-black text-gray-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none appearance-none"
                  placeholder="0"
                />
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex gap-3 pt-2">
              <button
                className="flex-[2] bg-emerald-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-100 active:scale-95 transition-transform"
                onClick={submit}
              >
                捐款 ( Donate )
              </button>
            </div>

            {/* 感謝訊息 */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 text-emerald-500">
                <User size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-emerald-900">
                  施主謝謝你 ! ( Thank you, Supporter! )
                </h4>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  你的 ${inputAmount} 捐款可以幫助這位乞丐可以好好過生活
                </p>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  ( Your ${inputAmount} donation will help the beggar can have
                  good situation to live . )
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donation;
