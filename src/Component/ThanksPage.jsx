import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function ThanksPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. 從 sessionStorage 拿出剛剛存的金額
    const saveAmount = sessionStorage.getItem("donationAmount");

    // 防呆機制：如果沒抓到，就顯示空字串或預設文字

    const displayAmount = saveAmount ? saveAmount : "未知金額";

    // 當使用者回到這個頁面時，顯示感謝視窗
    Swal.fire({
      title: "捐款成功！",
      text: `感謝您的愛心，阿信已經收到您$${displayAmount}元的支持了。`,
      icon: "success",
      confirmButtonText: "回到首頁",
      confirmButtonColor: "#10B981",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        // 2. 離開前把 sessionStorage 清空，保持資料乾淨
        sessionStorage.removeItem("donationAmount");
        navigate("/"); // 使用者點擊按鈕後回到主頁
      }
    });
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-800">
        正在處理您的捐款資訊...
      </h1>
      <p className="text-gray-500">感謝您的耐心等候</p>
    </div>
  );
}

export default ThanksPage;
