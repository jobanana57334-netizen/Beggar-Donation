import { Routes, Route } from "react-router-dom";

import Donation from "./Component/donation";
import ThanksPage from "./Component/ThanksPage";
import PaymentFailed from "./Component/paymentFailed";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Donation />} />
      <Route path="/thanks" element={<ThanksPage />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
    </Routes>
  );
}

export default App;
