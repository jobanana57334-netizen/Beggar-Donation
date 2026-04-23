import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useEffect } from "react";

const PaymentFailed = () => {
  const navigate = useNavigate();
  useEffect(() => {
    Swal.fire({
      title: "付款失敗!",
      text: "很抱歉，您的付款未能成功完成。請檢查您的付款資訊並重試。",
      icon: "error",
      confirmButtonText: "回首頁",
      confirmButtonColor: "#EF4444",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/");
      }
    });
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-800">
        您的捐款失敗，請稍後...
      </h1>
      <p className="text-gray-500">感謝您的耐心等候</p>
    </div>
  );
};

export default PaymentFailed;
