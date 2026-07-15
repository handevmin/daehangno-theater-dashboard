import { useEffect, useState } from "react";
import { QRCode } from "../../app/components/QRCode";
import imgNora from "./nora.png";
import imgRomeo from "./romeo.png";
import imgMacbeth from "./macbeth.png";
import imgAntigone from "./antigone.png";
import imgFalstaff from "./falstaff.png";
import imgHamlet from "./hamlet.png";
import imgComic from "./comic.png";
import imgAvatar1 from "./avatar1.png";
import imgAvatar2 from "./avatar2.png";
import imgAvatar3 from "./avatar3.png";
import imgAvatar4 from "./avatar4.png";

// 극캐감별사(/quiz) 홍보 슬라이드 — QR 스캔으로 모바일 심리테스트 유도.
// 카드 캐릭터 6종이 한 칸씩 왼쪽으로 슬라이드하며, 가운데(3번째) 카드가 강조(골드+대사)된다.

// 카드 슬라이더 치수/타이밍
const CARD_W = 268;
const GAP = 14;
const STEP = CARD_W + GAP; // 한 칸 이동 거리
const FEATURED_SLOT = 2; // 강조 카드가 놓이는 화면상 슬롯(0-based) = 가운데
const HOLD_MS = 2600; // 캐릭터당 노출 시간
const SLIDE_MS = 620; // 슬라이드 전환 시간

interface Character {
  name: string;
  desc: string;
  img: string;
  crop: string; // 카드 프레임에 맞춘 이미지 크롭(컨테이너 대비 %라 일반/강조 카드에 공용)
  quote: string[]; // 강조 카드 대사 (최대 3줄)
  source: string;
}

// 캐릭터별 이미지 크롭(피그마 원본 배치 그대로 — 몸통이 카드 프레임에 맞게 확대·이동됨)
const CHARACTERS: Character[] = [
  {
    name: "노라",
    desc: "삶을 개척하는 독립가",
    img: imgNora,
    crop: "h-[145.27%] left-[-25.48%] top-[-22.85%] w-[151.55%]",
    quote: ["“전 이제 제 자신을 알아야 해요.", "저에게는 제 인생이 있어요”"],
    source: "헨리크 입센 『인형의 집』",
  },
  {
    name: "로미오",
    desc: "순수하고 뜨거운 로맨티스트",
    img: imgRomeo,
    crop: "h-[146.11%] left-[-25.58%] top-[-19.44%] w-[152.91%]",
    quote: ["“저곳이 동쪽이라면", "줄리엣은 태양이로구나!”"],
    source: "윌리엄 셰익스피어 『로미오와 줄리엣』",
  },
  {
    name: "맥베스",
    desc: "야망으로 불타는 승부사",
    img: imgMacbeth,
    crop: "h-[152.78%] left-[-32.56%] top-[-23.89%] w-[159.88%]",
    quote: ["“별들이여, 빛을 감추어라!", "나의 검고 깊은 야망은 비추지 말거라.”"],
    source: "윌리엄 셰익스피어 『맥베스』",
  },
  {
    name: "안티고네",
    desc: "단단하고 고결한 신념가",
    img: imgAntigone,
    crop: "h-[136.67%] left-[-19.19%] top-[-16.67%] w-[143.02%]",
    quote: ["“허나 나는 그를 묻겠노라—", "설령 죽음을 맞이한다 하여도,", "이 죄가 곧 성스러운 일이라 단언하노라”"],
    source: "소포클레스 『안티고네』",
  },
  {
    name: "팔스타프",
    desc: "현재를 즐기는 감각주의자",
    img: imgFalstaff,
    crop: "h-[134.67%] left-[-20.54%] top-[-15.06%] w-[141.09%]",
    quote: ["“명예가 무엇이냐? 한낱 말일 뿐.", "그 말 속에 무엇이 있느냐? 공기뿐이다”"],
    source: "윌리엄 셰익스피어 『헨리 4세』",
  },
  {
    name: "햄릿",
    desc: "신중하고 깊이 있는 사색가",
    img: imgHamlet,
    crop: "h-[138.33%] left-[-21.51%] top-[-13.89%] w-[144.77%]",
    quote: ["“죽느냐 사느냐, 그것이 문제로다”"],
    source: "윌리엄 셰익스피어 『햄릿』",
  },
];

// 겹쳐 놓은 참여자 아바타(원형) — 마지막 칸은 "+8"
const AVATARS: { img: string; crop: string }[] = [
  { img: imgAvatar1, crop: "h-[188.8%] left-0 top-[-3.55%] w-full" },
  { img: imgAvatar2, crop: "h-[160.56%] left-0 top-[-2.42%] w-full" },
  { img: imgAvatar3, crop: "h-full left-[-0.54%] top-0 w-[101.08%]" },
  { img: imgAvatar4, crop: "h-[192.05%] left-0 top-[-3.68%] w-full" },
];

function Chevron({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" preserveAspectRatio="none" viewBox="0 0 12 20">
      <path d="M1.9 1L10.2 10L1.9 19" stroke="#FFB73B" strokeLinejoin="round" strokeWidth="2.25" />
    </svg>
  );
}

// 일반 캐릭터 카드 (268×268)
function CharCard({ name, desc, img, crop }: Character) {
  return (
    <div className="bg-[#e6e4e0] relative rounded-[17.48px] shrink-0 size-[268px]">
      <div className="-translate-x-1/2 absolute bottom-[123px] h-[180px] left-1/2 w-[172px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt={name} className={`absolute max-w-none ${crop}`} src={img} />
        </div>
      </div>
      <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[6px] items-center left-1/2 px-[17.48px] text-[#121212] text-center top-[145px] w-[268px]">
        <p className="font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] leading-[1.5] text-[22px] w-full">{name}</p>
        <p className="font-['SUIT:SemiBold',sans-serif] leading-[normal] text-[15px] w-full">{desc}</p>
      </div>
    </div>
  );
}

// 강조 카드 (268×297, 골드 배경 + 대사 인용) — 슬라이더 가운데 칸
function FeaturedCard({ name, img, crop, quote, source }: Character) {
  return (
    <div className="bg-[#ffb73b] h-[297px] relative rounded-[17.48px] shrink-0 w-[268px]">
      <div className="-translate-x-1/2 absolute bottom-[150px] h-[200px] left-1/2 w-[190px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt={name} className={`absolute max-w-none ${crop}`} src={img} />
        </div>
      </div>
      <div className="-translate-x-1/2 absolute content-stretch flex flex-col h-[150px] items-center justify-between left-1/2 pb-[19.228px] pt-[8.74px] px-[17.48px] text-[#121212] text-center top-[147px] w-[268px]">
        <div className="content-stretch flex flex-col gap-[6px] items-center relative shrink-0 w-full">
          <p className="font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] leading-[1.5] text-[22px] w-full">{name}</p>
          <div className="font-['SUIT:SemiBold',sans-serif] text-[15px] tracking-[-0.3px] w-full">
            {quote.map((line, i) => (
              <p key={i} className="leading-[normal] mb-0">
                {line}
              </p>
            ))}
          </div>
        </div>
        <p className="font-['SUIT:Medium',sans-serif] leading-[normal] shrink-0 text-[13px] w-full">{source}</p>
      </div>
    </div>
  );
}

export default function Component() {
  const quizUrl = `${window.location.origin}/quiz`;

  // 카드 스트립: 한 칸(step)씩 왼쪽으로 이동. 강조 카드는 항상 화면 가운데 칸(step + FEATURED_SLOT).
  // 한 바퀴(CHARACTERS.length) 돌면 화면이 시작과 동일해지므로, 그 순간 애니메이션을 끄고
  // step 을 0 으로 되돌려 무한 순환을 이음매 없이 만든다.
  const LEN = CHARACTERS.length;
  const [step, setStep] = useState(0);
  const [anim, setAnim] = useState(true);

  useEffect(() => {
    if (step >= LEN) {
      // 마지막 전환이 끝나면 티 나지 않게 원점으로 스냅
      const t = setTimeout(() => {
        setAnim(false);
        setStep(0);
      }, SLIDE_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), HOLD_MS);
    return () => clearTimeout(t);
  }, [step, LEN]);

  // 스냅 직후 다음 프레임에 트랜지션 복구 (스냅 자체는 애니메이션 없이)
  useEffect(() => {
    if (anim) return;
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true)));
    return () => cancelAnimationFrame(r);
  }, [anim]);

  // 3벌 반복 → step..step+5 창과 강조(step+2)가 항상 채워진다
  const cards = [...CHARACTERS, ...CHARACTERS, ...CHARACTERS];

  return (
    <div className="bg-[#f7f8f9] relative size-full" data-name="극캐감별사">
      {/* 제목 형광펜 하이라이트 */}
      <div className="absolute bg-[rgba(255,183,59,0.8)] h-[34px] left-[407px] top-[224px] w-[321px]" />
      <p className="[word-break:break-word] absolute font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] leading-[normal] left-[76px] not-italic text-[#121212] text-[54px] top-[177px] whitespace-nowrap">
        당신 안에 숨은 연극 속 캐릭터는?
      </p>
      <p className="[word-break:break-word] absolute font-['SUIT:SemiBold',sans-serif] leading-[normal] left-[80px] not-italic text-[22px] text-[rgba(18,18,18,0.8)] top-[268px] whitespace-nowrap">
        몇 가지 질문에 답하면 당신과 가장 닮은 한 명을 찾아드려요.
      </p>

      {/* 좌상단 만화 컷 */}
      <div className="absolute border border-[#121212] border-solid h-[110px] left-[76px] rounded-[8px] top-[66px] w-[196px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[8px] size-full" src={imgComic} />
      </div>

      {/* QR 카드 */}
      <div className="absolute bg-[#121212] content-stretch flex flex-col gap-[19.875px] items-center justify-end left-[935px] overflow-clip rounded-[27.102px] top-[65px] w-[435px]">
        <div className="bg-[#ffb73b] content-stretch flex h-[51px] items-center justify-center pb-[10px] pt-[14px] px-[10px] relative shrink-0 w-full">
          <p className="[word-break:break-word] font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#121212] text-[21px] whitespace-pre">{`극캐감별사  · 성향 진단 테스트`}</p>
        </div>
        <div className="content-stretch flex gap-[20px] items-end pb-[20px] px-[20px] relative shrink-0">
          <div className="bg-white h-[139.282px] relative rounded-[14.359px] shrink-0 w-[140px]">
            <QRCode value={quizUrl} size={123} className="absolute left-[8.6px] top-[8.6px]" />
          </div>
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[3.614px] items-start not-italic py-[9.034px] relative shrink-0 w-[235px]">
            <p className="font-['SUIT:Heavy',sans-serif] leading-[normal] relative shrink-0 text-[#ffb73b] text-[15.358px] w-full">2분 이내</p>
            <div className="font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] relative shrink-0 text-[22px] text-white w-full">
              <p className="leading-[34.329px] mb-0">QR 스캔하고</p>
              <p className="leading-[34.329px]">나의 연극 캐릭터 찾기</p>
            </div>
          </div>
          <Chevron className="absolute h-[20px] right-[71px] top-[8.13px] w-[12px]" />
          <Chevron className="absolute h-[20px] right-[48px] top-[8.13px] w-[12px]" />
          <Chevron className="absolute h-[20px] right-[25px] top-[8.13px] w-[12px]" />
        </div>
      </div>

      {/* 참여자 아바타 + "+8" */}
      <div className="absolute h-[39px] left-[1210px] top-[308px] w-[152px]">
        {AVATARS.map((a, i) => (
          <div
            key={i}
            className="absolute bg-[#ede8dc] border-[#121212] border-[1.009px] border-solid overflow-clip rounded-full size-[39px] top-0"
            style={{ left: i * 28.24 }}
          >
            <div className="absolute inset-[0.34px]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-full">
                <img alt="" className={`absolute max-w-none ${a.crop}`} src={a.img} />
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bg-[#121212] border-[#121212] border-[1.009px] border-solid left-[112.97px] rounded-full size-[39px] top-0">
          <p className="-translate-x-1/2 -translate-y-1/2 absolute font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] left-1/2 not-italic text-[#f5c518] text-[13.466px] text-center top-1/2">+8</p>
        </div>
      </div>

      {/* 캐릭터 카드 스트립 — 한 칸씩 슬라이드하며 가운데 카드가 강조 (1440px 초과분은 잘림) */}
      <div className="absolute h-[350px] left-0 overflow-clip top-[328px] w-[1440px]">
        <div
          className="absolute content-stretch flex items-end left-0 px-[24px] top-[53px]"
          style={{
            gap: GAP,
            transform: `translateX(${-step * STEP}px)`,
            transition: anim ? `transform ${SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)` : "none",
          }}
        >
          {cards.map((c, i) =>
            i === step + FEATURED_SLOT ? (
              <FeaturedCard key={i} {...c} />
            ) : (
              <CharCard key={i} {...c} />
            ),
          )}
        </div>
      </div>
    </div>
  );
}
