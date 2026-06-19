import { useNavigate } from "react-router";
import MapComponent from "../../imports/지도";

export default function MapPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#f7f8f9] flex items-center justify-center p-8">
      <div className="w-[1440px] h-[1024px] relative">
        <MapComponent />
        <div className="absolute bottom-8 right-8 flex gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white border-2 border-black px-6 py-3 rounded-full font-['SUIT:Bold',sans-serif] text-[16px] hover:bg-gray-50 transition-colors"
          >
            대시보드
          </button>
          <button
            onClick={() => navigate("/top5")}
            className="bg-[var(--accent)] border-2 border-black px-6 py-3 rounded-full font-['SUIT:Bold',sans-serif] text-[16px] transition-colors"
          >
            Top 5 보기 →
          </button>
        </div>
      </div>
    </div>
  );
}
