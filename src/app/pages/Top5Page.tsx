import { useNavigate } from "react-router";
import Top5Component from "../../imports/연극15";

export default function Top5Page() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#f7f8f9] flex items-center justify-center p-8">
      <div className="w-[1440px] h-[1024px] relative">
        <Top5Component />
        <div className="absolute bottom-8 left-[157px] flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="bg-white border-2 border-black px-6 py-3 rounded-full font-['SUIT:Bold',sans-serif] text-[16px] hover:bg-gray-50 transition-colors"
          >
            ← 지도로 돌아가기
          </button>
          <button
            onClick={() => navigate("/top6-10")}
            className="bg-[var(--accent)] border-2 border-black px-6 py-3 rounded-full font-['SUIT:Bold',sans-serif] text-[16px] transition-colors"
          >
            다음 (6-10위) →
          </button>
        </div>
      </div>
    </div>
  );
}
