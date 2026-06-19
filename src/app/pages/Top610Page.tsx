import { useNavigate } from "react-router";
import Top610Component from "../../imports/연극610";

export default function Top610Page() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#f7f8f9] flex items-center justify-center p-8">
      <div className="w-[1440px] h-[1024px] relative">
        <Top610Component />
        <button
          onClick={() => navigate("/top5")}
          className="absolute bottom-8 left-[157px] bg-white border-2 border-black px-6 py-3 rounded-full font-['SUIT:Bold',sans-serif] text-[16px] hover:bg-gray-50 transition-colors"
        >
          ← Top 1-5로 돌아가기
        </button>
      </div>
    </div>
  );
}
