import { Fragment, useEffect, useRef } from "react";
import svgPaths from "./svg-sp9cg5efrd";
import imgImage48 from "./6702290366fe491b3b436f829f55bfe1f4fe056f.png";
import { proxyImg } from "../../app/lib/kopis";
import type { CurationContent, CurationPlay } from "../../app/lib/curation";
import { CURATION } from "../../app/lib/curation";

/* eslint-disable @typescript-eslint/no-unused-vars */
void imgImage48; // 아래 원본(하드코딩) 컴포넌트 호환용 — 실제 렌더는 데이터 기반 컴포넌트 사용

// 관리자 WYSIWYG 편집 핸들러
export interface CurationEdit {
  onField: (k: keyof CurationContent, v: string) => void;
  onTags: (tags: string[]) => void;
  onPlay: (i: number, patch: Partial<CurationPlay>) => void;
  onSearch: (i: number) => void;
  onAddPlay: () => void;
  onRemovePlay: (i: number) => void;
}

// 실제 렌더 스타일 그대로 두고 contentEditable로 인라인 편집 (blur 시 커밋 → 커서 안 튐)
function Editable({ value, onCommit, className, style }: { value: string; onCommit: (v: string) => void; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) ref.current.innerText = value;
  }, [value]);
  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      className={className}
      style={{ outline: "none", cursor: "text", display: "inline-block", minWidth: 10, ...style }}
      onBlur={(e) => onCommit(e.currentTarget.innerText.replace(/ /g, " "))}
    />
  );
}

// ===== 데이터 기반 추천 콘텐츠 컴포넌트 =====
function DMoodCard({ c, edit }: { c: CurationContent; edit?: CurationEdit }) {
  return (
    <div className="bg-[var(--accent)] content-stretch flex flex-col h-[367px] items-center justify-between py-[6px] relative rounded-[12px] shrink-0 w-full">
      <div aria-hidden className="absolute border-[2.5px] border-black border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
        <div className="flex items-center px-[20px] py-[14px] w-full">
          <div className="bg-white content-stretch flex items-center justify-center px-[16px] py-[4px] relative rounded-[999px] shrink-0">
            <div aria-hidden className="absolute border-2 border-[#121212] border-solid inset-0 pointer-events-none rounded-[999px]" />
            <p className="font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] text-[#121212] text-[16px] whitespace-nowrap">#{edit ? <Editable value={c.hashtag} onCommit={(v) => edit.onField("hashtag", v)} /> : c.hashtag}</p>
          </div>
        </div>
        <div className="flex items-center px-[22px] w-full">
          <p className="flex-[1_0_0] font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] max-h-[46px] min-w-px overflow-hidden text-[#121212] text-[32px] text-ellipsis tracking-[1.28px]">{edit ? <Editable value={c.moodTitle} onCommit={(v) => edit.onField("moodTitle", v)} /> : c.moodTitle}</p>
        </div>
        <div className="h-[171px] w-full">
          <div className="flex items-center justify-center px-[22px] py-[18px] size-full">
            <p className="flex-[1_0_0] font-['SUIT:SemiBold',sans-serif] h-[97px] leading-[1.5] min-w-px overflow-hidden text-[#121212] text-[18px] text-ellipsis tracking-[-0.36px] whitespace-pre-wrap">{edit ? <Editable value={c.moodDesc} onCommit={(v) => edit.onField("moodDesc", v)} style={{ display: "block", whiteSpace: "pre-wrap" }} /> : c.moodDesc}</p>
          </div>
        </div>
      </div>
      <div className="relative shrink-0 w-full">
        <div aria-hidden className="absolute border-black border-solid border-t inset-0 pointer-events-none" />
        <div className="flex items-center justify-between pb-[18px] pt-[24px] px-[22px] w-full">
          <div className="content-stretch flex items-center relative shrink-0">
            <p className="font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] mr-[-3px] text-[#121212] text-[16px] tracking-[0.64px] whitespace-nowrap">추천 분위기</p>
            <div className="h-[13px] ml-[8px] relative shrink-0 w-[20px]">
              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 13"><path d={svgPaths.p13ef1dc0} stroke="black" strokeLinejoin="round" strokeWidth="1.5" /></svg>
            </div>
          </div>
          <div className="bg-[#121212] content-stretch flex items-center justify-center p-[10px] relative rounded-[999px] shrink-0 min-w-[140px]">
            <div aria-hidden className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[999px]" />
            <p className="font-['SUIT:ExtraBold',sans-serif] text-[14px] text-white tracking-[0.14px] whitespace-nowrap">{edit ? <Editable value={c.vibe} onCommit={(v) => edit.onField("vibe", v)} /> : c.vibe}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DTags({ tags, edit }: { tags: string[]; edit?: CurationEdit }) {
  const setTag = (i: number, v: string) => edit?.onTags(tags.map((x, j) => (j === i ? v : x)).filter((x) => x.trim() !== ""));
  return (
    <div className="content-center flex flex-wrap gap-[9px] items-center py-[16px] relative shrink-0 w-full">
      {tags.map((t, i) => (
        <div key={i} className="bg-[#fafafa] content-stretch flex items-center justify-center px-[12px] py-[4px] relative rounded-[999px] shrink-0">
          <div aria-hidden className="absolute border border-[#121212] border-solid inset-0 pointer-events-none rounded-[999px]" />
          <p className="font-['SUIT:SemiBold',sans-serif] text-[#121212] text-[16px] whitespace-nowrap">#{edit ? <Editable value={t} onCommit={(v) => setTag(i, v)} /> : t}</p>
          {edit ? <button onClick={() => edit.onTags(tags.filter((_, j) => j !== i))} className="ml-[4px] text-[#c00] text-[14px] leading-none" title="태그 삭제">×</button> : null}
        </div>
      ))}
      {edit ? (
        <button onClick={() => edit.onTags([...tags, "새 태그"])} className="bg-white content-stretch flex items-center justify-center px-[12px] py-[4px] rounded-[999px] border border-dashed border-[#999] text-[#666] text-[15px]" title="태그 추가">+ 태그</button>
      ) : null}
    </div>
  );
}

function DPlayRow({ play, n, i, edit }: { play: CurationContent["plays"][number]; n: number; i?: number; edit?: CurationEdit }) {
  const setP = (k: keyof CurationPlay, v: string) => edit && i != null && edit.onPlay(i, { [k]: v });
  return (
    <div className="relative shrink-0 w-[759px]">
      <div className="absolute left-[-34px] size-[53.922px] top-[-9px] z-[10]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 53.1024 52.2956"><path d={svgPaths.p2066ca72} fill="var(--accent)" stroke="black" strokeWidth="1.61765" /></svg>
        <p className="-translate-x-1/2 absolute font-['SUIT:ExtraBold',sans-serif] left-1/2 text-[#121212] text-[15px] text-center top-[calc(50%-9px)] whitespace-nowrap">{n}</p>
      </div>
      {edit && i != null ? (
        <div className="absolute right-0 top-[-6px] z-[20] flex gap-[6px]">
          <button onClick={() => edit.onSearch(i)} className="bg-[#121212] text-white text-[13px] rounded-[6px] px-[10px] py-[4px]">🔍 KOPIS 검색</button>
          <button onClick={() => edit.onRemovePlay(i)} className="bg-white border border-[#c00] text-[#c00] text-[13px] rounded-[6px] px-[10px] py-[4px]">삭제</button>
        </div>
      ) : null}
      <div className="content-stretch flex gap-[24px] h-[212px] items-center w-full">
        <div className="content-stretch flex items-center relative shrink-0">
          <div aria-hidden className="absolute border-[#121212] border-[2.4px] border-solid inset-[-2.4px] pointer-events-none" />
          <div className="bg-[#e3e2e0] h-[208px] overflow-hidden relative shrink-0 w-[156px]">
            {play.poster ? <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={proxyImg(play.poster)} /> : null}
            {edit && i != null && !play.poster ? <button onClick={() => edit.onSearch(i)} className="absolute inset-0 flex items-center justify-center text-[#555] text-[14px]">🔍 검색</button> : null}
          </div>
        </div>
        <div className="flex-[1_0_0] h-full min-w-px relative">
          <div className="content-stretch flex flex-col items-start justify-between py-[8px] size-full">
            <div className="flex h-[35px] items-center w-full">
              <p className="flex-[1_0_0] font-['Elice_DX_Neolli_OTF:Medium',sans-serif] h-full leading-[1.25] min-w-px overflow-hidden text-[#121212] text-[28px] text-ellipsis whitespace-nowrap">{edit ? <Editable value={play.title} onCommit={(v) => setP("title", v)} /> : play.title}</p>
            </div>
            <div className="content-stretch flex flex-col gap-[2px] items-start w-full">
              <div className="flex gap-[6px] items-center pr-[4px] w-full">
                <div className="relative shrink-0 size-[24px]"><div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2"><svg className="block size-full" fill="none" viewBox="0 0 16 16"><path d={svgPaths.p29da5b00} fill="#121212" /></svg></div></div>
                <p className="flex-[1_0_0] font-['SUIT:Medium',sans-serif] min-w-px overflow-hidden text-[16px] text-black text-ellipsis whitespace-nowrap">{edit ? <Editable value={play.venue} onCommit={(v) => setP("venue", v)} /> : play.venue}</p>
              </div>
              <div className="flex gap-[6px] items-center pr-[4px] w-full">
                <div className="relative shrink-0 size-[24px]"><div className="absolute inset-[12.5%_12.5%_0.77%_12.5%]"><svg className="block size-full" fill="none" viewBox="0 0 12.6 14.5705"><path d={svgPaths.p9916500} fill="#121212" /></svg></div></div>
                <p className="font-['SUIT:Medium',sans-serif] text-[#121212] text-[16px] whitespace-nowrap">{edit ? <><Editable value={play.from} onCommit={(v) => setP("from", v)} /> ~ <Editable value={play.to} onCommit={(v) => setP("to", v)} /></> : <>{play.from} ~ {play.to}</>}</p>
              </div>
            </div>
            <div className="flex gap-[24px] items-center px-[4px]">
              <div className="flex gap-[10px] items-center">
                <p className="font-['SUIT:ExtraBold',sans-serif] text-[#121212] text-[14px] whitespace-nowrap">러닝타임</p>
                <div className="bg-white content-stretch flex h-[30px] items-center justify-center px-[12px] py-[6px] relative rounded-[999px] shrink-0"><div aria-hidden className="absolute border-[#121212] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[999px]" /><p className="font-['SUIT:Bold',sans-serif] text-[#121212] text-[14px] whitespace-nowrap">{edit ? <Editable value={play.runtime} onCommit={(v) => setP("runtime", v)} /> : play.runtime}</p></div>
              </div>
              <div className="bg-[#121212] h-[20px] w-px" />
              <div className="flex gap-[10px] items-center">
                <p className="font-['SUIT:ExtraBold',sans-serif] text-[#121212] text-[14px] whitespace-nowrap">관람연령</p>
                <div className="bg-[#c3ff83] content-stretch flex items-center justify-center px-[10px] py-[6px] relative rounded-[999px] shrink-0 size-[30px]"><div aria-hidden className="absolute border-[#121212] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[999px]" /><p className="font-['SUIT:Bold',sans-serif] text-[#121212] text-[14px] whitespace-nowrap">{edit ? <Editable value={play.age} onCommit={(v) => setP("age", v)} /> : play.age}</p></div>
              </div>
            </div>
            <div className="bg-[rgba(255,183,59,0.2)] relative rounded-[5px] w-full">
              <div aria-hidden className="absolute border border-[var(--accent)] border-solid inset-0 pointer-events-none rounded-[5px]" />
              <div className="flex items-center p-[10px] w-full"><p className="flex-[1_0_0] font-['SUIT:Bold',sans-serif] min-w-px overflow-hidden text-[16px] text-black text-ellipsis whitespace-nowrap">“{edit ? <Editable value={play.quote} onCommit={(v) => setP("quote", v)} /> : play.quote}”</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DContents({ content, edit }: { content: CurationContent; edit?: CurationEdit }) {
  return (
    <div className={`absolute h-[594px] left-[159px] top-[126px] w-[1254px] ${edit ? "overflow-visible" : "overflow-clip"}`} data-name="Contents">
      <div className="absolute content-stretch flex flex-col items-start left-0 top-[39px] w-[426px]">
        <DMoodCard c={content} edit={edit} />
        <DTags tags={content.tags} edit={edit} />
      </div>
      {content.plays.slice(0, 2).map((_, i) => (
        <div key={i} className="absolute bg-[#121212] h-[10px] left-[424px] w-[25px]" style={{ top: i === 0 ? 102 : 256 }} />
      ))}
      <div className="absolute content-stretch flex flex-col gap-[30px] items-start left-[447px] pb-[100px] pt-[24px] px-[24px] rounded-tl-[12px] rounded-tr-[12px] top-[39px]">
        <div aria-hidden className="absolute border-[#121212] border-[2.5px] border-solid inset-0 pointer-events-none rounded-tl-[12px] rounded-tr-[12px]" />
        {content.plays.map((p, i) => (
          <Fragment key={i}>
            {i > 0 && <div className="bg-[#121212] h-px shrink-0 w-[759px]" />}
            <DPlayRow play={p} n={i + 1} i={i} edit={edit} />
          </Fragment>
        ))}
        {edit ? (
          <button onClick={edit.onAddPlay} className="w-[759px] border border-dashed border-[#999] rounded-[8px] py-[12px] text-[#666] text-[16px] bg-white/60">+ 공연 추가</button>
        ) : null}
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute h-[720px] left-0 top-0 w-[117px]">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 117 720">
        <g clipPath="url(#clip0_1_173)" id="Frame 5">
          <rect fill="#121212" height="720" width="117" />
          <path d={svgPaths.p6eeba80} id="Line 1" stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
          <g id="Group 2">
            <path d="M-51 576L192.5 743.5" id="Vector 2" stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
            <g id="Ellipse 5">
              <circle cx="109" cy="687" fill="var(--fill-0, #FFBF6B)" r="12" />
              <circle cx="109" cy="687" r="10.5" stroke="var(--stroke-0, #121212)" strokeOpacity="0.15" strokeWidth="3" />
            </g>
            <g id="Ellipse 8">
              <circle cx="56" cy="650" fill="var(--fill-0, #FFBF6B)" r="12" />
              <circle cx="56" cy="650" r="10.5" stroke="var(--stroke-0, #121212)" strokeOpacity="0.15" strokeWidth="3" />
            </g>
            <g id="Ellipse 7">
              <circle cx="2" cy="611" fill="var(--fill-0, #FFBF6B)" r="12" />
              <circle cx="2" cy="611" r="10.5" stroke="var(--stroke-0, #121212)" strokeOpacity="0.15" strokeWidth="3" />
            </g>
          </g>
          <g id="Group 3">
            <path d="M-78 609L165.5 776.5" id="Vector 2_2" stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
            <g id="Ellipse 5_2">
              <circle cx="82" cy="720" fill="var(--fill-0, #C2FFAA)" r="12" />
              <circle cx="82" cy="720" r="10.5" stroke="var(--stroke-0, #121212)" strokeOpacity="0.15" strokeWidth="3" />
            </g>
            <g id="Ellipse 8_2">
              <circle cx="29" cy="683" fill="var(--fill-0, #C2FFAA)" r="12" />
              <circle cx="29" cy="683" r="10.5" stroke="var(--stroke-0, #121212)" strokeOpacity="0.15" strokeWidth="3" />
            </g>
            <g id="Ellipse 7_2">
              <circle cx="-25" cy="644" fill="var(--fill-0, #C2FFAA)" r="12" />
              <circle cx="-25" cy="644" r="9.5" stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
            </g>
          </g>
          <g id="Ellipse 1">
            <circle cx="56" cy="175" fill="var(--fill-0, #4D4D4D)" r="12" />
            <circle cx="56" cy="175" r="9.5" stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
          </g>
          <g id="Ellipse 2">
            <ellipse cx="56" cy="527.5" fill="var(--fill-0, var(--accent))" rx="12" ry="11.5" />
            <path d={svgPaths.p30565400} stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
          </g>
          <g id="Ellipse 3">
            <circle cx="56" cy="351" fill="var(--fill-0, #4D4D4D)" r="12" />
            <circle cx="56" cy="351" r="9.5" stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
          </g>
          <g id="Ellipse 4">
            <circle cx="56" cy="439" fill="var(--fill-0, #4D4D4D)" r="12" />
            <circle cx="56" cy="439" r="9.5" stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
          </g>
          <g id="Ellipse 5_3">
            <ellipse cx="56" cy="263.5" fill="var(--fill-0, #4D4D4D)" rx="12" ry="11.5" />
            <path d={svgPaths.p12480e00} stroke="var(--stroke-0, white)" strokeOpacity="0.2" strokeWidth="5" />
          </g>
          <path d={svgPaths.p27d3dc00} id="Vector 1" stroke="var(--stroke-0, white)" strokeDasharray="4 4" strokeOpacity="0.9" strokeWidth="3" />
        </g>
        <defs>
          <clipPath id="clip0_1_173">
            <rect fill="white" height="720" width="117" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Wrap({ source }: { source: string }) {
  return (
    <div className="[word-break:break-word] absolute content-stretch flex font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] gap-[6px] items-center leading-[normal] left-[36px] not-italic text-[34px] top-[25px] whitespace-nowrap" data-name="wrap">
      <p className="relative shrink-0 text-[var(--accent)]">{source}</p>
      <p className="relative shrink-0 text-white">가 추천하는 오늘의 공연</p>
    </div>
  );
}

function ArrowUpRight() {
  return (
    <div className="absolute border-l-2 border-solid border-white bottom-px overflow-clip right-0 top-0 w-[102px]" data-name="arrow-up-right">
      <div className="absolute inset-[31.86%_calc(31.37%+0.63px)_29.17%_calc(29.17%-1.42px)]" data-name="Vector">
        <div className="absolute inset-[-5.34%_-5.27%_-2.68%_-2.62%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 43.4253 42.9385">
            <path d={svgPaths.p39575900} fill="var(--stroke-0, white)" id="Vector" />
          </svg>
        </div>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%-1px)] size-[42.5px] top-1/2" data-name="Vector">
        <div className="absolute inset-[-3.53%_-3.53%_-3.53%_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 45.5">
            <path d={svgPaths.p2b8cd1e0} fill="var(--stroke-0, white)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Wrap1() {
  return (
    <div className="-translate-x-1/2 [word-break:break-word] absolute content-stretch flex flex-col items-start left-[calc(50%+468px)] not-italic top-[27px] w-[140px]" data-name="wrap">
      <p className="font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] leading-[24px] relative shrink-0 text-[var(--accent)] text-[13px] tracking-[0.52px] uppercase w-full whitespace-nowrap">Live Curating</p>
      <p className="font-['Elice_DigitalBaeum_OTF:Regular',sans-serif] leading-[normal] relative shrink-0 text-[16px] text-[rgba(255,255,255,0.6)] tracking-[-0.32px] w-full">실시간 추천</p>
    </div>
  );
}

function Group2() {
  return (
    <div className="-translate-x-1/2 absolute contents left-[calc(50%+437px)] top-[27px]">
      <div className="-translate-x-1/2 absolute left-[calc(50%+384px)] size-[8px] top-[36px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, var(--accent))" id="Ellipse 65" r="4" />
        </svg>
      </div>
      <Wrap1 />
    </div>
  );
}

function Frame3({ source }: { source: string }) {
  return (
    <div className="absolute bg-[#121212] h-[103px] left-[159px] overflow-clip rounded-[12px] top-[24px] w-[1254px]">
      <Wrap source={source} />
      <ArrowUpRight />
      <Group2 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center px-[16px] py-[4px] relative rounded-[999px] shrink-0">
      <div aria-hidden className="absolute border-2 border-[#121212] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#121212] text-[16px] whitespace-nowrap">#유쾌한 하루</p>
    </div>
  );
}

function Wrap4() {
  return (
    <div className="relative shrink-0 w-full" data-name="wrap">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[20px] py-[14px] relative size-full">
          <Frame5 />
        </div>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[22px] relative size-full">
          <p className="[word-break:break-word] flex-[1_0_0] font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] leading-[normal] max-h-[46px] min-w-px not-italic overflow-hidden relative text-[#121212] text-[32px] text-ellipsis tracking-[1.28px]">유쾌한 하루</p>
        </div>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[171px] relative shrink-0 w-full" data-name="Text">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[22px] py-[18px] relative size-full">
          <div className="[word-break:break-word] flex-[1_0_0] font-['SUIT:SemiBold',sans-serif] h-[97px] leading-[0] min-w-px not-italic overflow-hidden relative text-[#121212] text-[18px] text-ellipsis tracking-[-0.36px] whitespace-pre-wrap">
            <p className="leading-[1.5] mb-0">더운 요즘, 조그만한 일에도 짜증이 나시죠?</p>
            <p className="leading-[1.5] mb-0">{`그러한 여러분의 짜증을 한방에 날려줄 유쾌한 `}</p>
            <p className="leading-[1.5]">공연을 추천드려요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Top() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="top">
      <Wrap4 />
      <Frame4 />
      <Text />
    </div>
  );
}

function ArrowRight() {
  return (
    <div className="h-[13px] relative shrink-0 w-[20px]" data-name="arrow-right">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 13">
        <g id="arrow-right">
          <path d={svgPaths.p13ef1dc0} id="Vector" stroke="var(--stroke-0, black)" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Wrap6() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="wrap">
      <p className="[word-break:break-word] font-['Elice_DigitalBaeum_OTF:Bold',sans-serif] leading-[normal] mr-[-3px] not-italic relative shrink-0 text-[#121212] text-[16px] tracking-[0.64px] whitespace-nowrap">추천 분위기</p>
      <ArrowRight />
    </div>
  );
}

function Tag() {
  return (
    <div className="bg-[#121212] content-stretch flex items-center justify-center p-[10px] relative rounded-[999px] shrink-0 w-[140px]" data-name="Tag">
      <div aria-hidden className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['SUIT:ExtraBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white tracking-[0.14px] whitespace-nowrap">개그 · 코미디</p>
    </div>
  );
}

function Wrap5() {
  return (
    <div className="relative shrink-0 w-full" data-name="wrap">
      <div aria-hidden className="absolute border-black border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[18px] pt-[24px] px-[22px] relative size-full">
          <Wrap6 />
          <Tag />
        </div>
      </div>
    </div>
  );
}

function Wrap3() {
  return (
    <div className="bg-[var(--accent)] content-stretch flex flex-col h-[367px] items-center justify-between py-[6px] relative rounded-[12px] shrink-0 w-full" data-name="Wrap">
      <div aria-hidden className="absolute border-[2.5px] border-black border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Top />
      <Wrap5 />
    </div>
  );
}

function Tag1() {
  return (
    <div className="bg-[#fafafa] content-stretch flex items-center justify-center px-[12px] py-[4px] relative rounded-[999px] shrink-0" data-name="Tag">
      <div aria-hidden className="absolute border border-[#121212] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['SUIT:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#121212] text-[16px] whitespace-nowrap">#대학로</p>
    </div>
  );
}

function Tag2() {
  return (
    <div className="bg-[#fafafa] content-stretch flex items-center justify-center px-[12px] py-[4px] relative rounded-[999px] shrink-0" data-name="Tag">
      <div aria-hidden className="absolute border border-[#121212] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['SUIT:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#121212] text-[16px] whitespace-nowrap">#소극장</p>
    </div>
  );
}

function Tag3() {
  return (
    <div className="bg-[#fafafa] content-stretch flex items-center justify-center px-[12px] py-[4px] relative rounded-[999px] shrink-0" data-name="Tag">
      <div aria-hidden className="absolute border border-[#121212] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['SUIT:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#121212] text-[16px] whitespace-nowrap">#감성적</p>
    </div>
  );
}

function Tag4() {
  return (
    <div className="bg-[#fafafa] content-stretch flex items-center justify-center px-[12px] py-[4px] relative rounded-[999px] shrink-0" data-name="Tag">
      <div aria-hidden className="absolute border border-[#121212] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['SUIT:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#121212] text-[16px] whitespace-nowrap">#공연 추천</p>
    </div>
  );
}

function Tag5() {
  return (
    <div className="bg-[#fafafa] content-stretch flex items-center justify-center px-[12px] py-[4px] relative rounded-[999px] shrink-0" data-name="Tag">
      <div aria-hidden className="absolute border border-[#121212] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['SUIT:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#121212] text-[16px] whitespace-nowrap">#공연 추천</p>
    </div>
  );
}

function Tag6() {
  return (
    <div className="bg-[#fafafa] content-stretch flex items-center justify-center px-[12px] py-[4px] relative rounded-[999px] shrink-0" data-name="Tag">
      <div aria-hidden className="absolute border border-[#121212] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['SUIT:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#121212] text-[16px] whitespace-nowrap">#공연 추천</p>
    </div>
  );
}

function Wrap7() {
  return (
    <div className="content-center flex flex-wrap gap-[9px] items-center py-[16px] relative shrink-0 w-full" data-name="wrap">
      <Tag1 />
      <Tag2 />
      <Tag3 />
      <Tag4 />
      <Tag5 />
      <Tag6 />
    </div>
  );
}

function Wrap2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 top-[39px] w-[426px]" data-name="wrap">
      <Wrap3 />
      <Wrap7 />
    </div>
  );
}

function Image() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Image">
      <div aria-hidden className="absolute border-[#121212] border-[2.4px] border-solid inset-[-2.4px] pointer-events-none" />
      <div className="h-[208px] relative shrink-0 w-[156px]" data-name="image 48">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage48} />
      </div>
    </div>
  );
}

function Title() {
  return (
    <div className="content-stretch flex h-[35px] items-center max-h-[35px] relative shrink-0 w-full" data-name="Title">
      <p className="[word-break:break-word] flex-[1_0_0] font-['Elice_DX_Neolli_OTF:Medium',sans-serif] h-full leading-[1.25] min-w-px not-italic overflow-hidden relative text-[#121212] text-[28px] text-ellipsis whitespace-nowrap">봄이 오면 산에 들에</p>
    </div>
  );
}

function TdesignLocationFilled() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="tdesign:location-filled">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="tdesign:location-filled">
          <path d={svgPaths.p29da5b00} fill="var(--fill-0, #121212)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IconLocation() {
  return (
    <div className="overflow-clip relative rounded-[699.3px] shrink-0 size-[24px]" data-name="Icon_Location">
      <TdesignLocationFilled />
    </div>
  );
}

function Wrap12() {
  return (
    <div className="relative shrink-0 w-full" data-name="Wrap">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[6px] items-center pr-[4px] relative size-full">
          <IconLocation />
          <p className="[word-break:break-word] flex-[1_0_0] font-['SUIT:Medium',sans-serif] leading-[normal] min-w-px not-italic overflow-hidden relative text-[16px] text-black text-ellipsis whitespace-nowrap">충무아트센터 중극장 블랙</p>
        </div>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[12.5%_12.5%_0.77%_12.5%]" data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.6 14.5705">
        <g id="Group">
          <g id="Vector" />
          <path d={svgPaths.p9916500} fill="var(--fill-0, #121212)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function MingcuteCalendarFill() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 overflow-clip size-[16.8px] top-1/2" data-name="mingcute:calendar-fill">
      <Group />
    </div>
  );
}

function IconCalendar() {
  return (
    <div className="overflow-clip relative rounded-[699.3px] shrink-0 size-[24px]" data-name="Icon_Calendar">
      <MingcuteCalendarFill />
    </div>
  );
}

function Wrap13() {
  return (
    <div className="relative shrink-0 w-full" data-name="Wrap">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[6px] items-center pr-[4px] relative size-full">
          <IconCalendar />
          <p className="[word-break:break-word] font-['SUIT:Medium',sans-serif] leading-[normal] not-italic overflow-hidden relative shrink-0 text-[#121212] text-[16px] text-ellipsis whitespace-nowrap">2026.05.23 ~ 2026.08.02</p>
        </div>
      </div>
    </div>
  );
}

function Wrap11() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-full" data-name="Wrap">
      <Wrap12 />
      <Wrap13 />
    </div>
  );
}

function Tag7() {
  return (
    <div className="bg-white content-stretch flex h-[30px] items-center justify-center px-[12px] py-[6px] relative rounded-[999px] shrink-0" data-name="Tag">
      <div aria-hidden className="absolute border-[#121212] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['SUIT:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#121212] text-[14px] whitespace-nowrap">1시간 30분</p>
    </div>
  );
}

function Wrap15() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="wrap">
      <p className="[word-break:break-word] font-['SUIT:ExtraBold',sans-serif] leading-[normal] not-italic overflow-hidden relative shrink-0 text-[#121212] text-[14px] text-ellipsis whitespace-nowrap">러닝타임</p>
      <Tag7 />
    </div>
  );
}

function Tag8() {
  return (
    <div className="bg-[#c3ff83] content-stretch flex items-center justify-center px-[10px] py-[6px] relative rounded-[999px] shrink-0 size-[30px]" data-name="Tag">
      <div aria-hidden className="absolute border-[#121212] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['SUIT:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#121212] text-[14px] whitespace-nowrap">12</p>
    </div>
  );
}

function Wrap16() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="wrap">
      <p className="[word-break:break-word] font-['SUIT:ExtraBold',sans-serif] leading-[normal] not-italic overflow-hidden relative shrink-0 text-[#121212] text-[14px] text-ellipsis whitespace-nowrap">관람연령</p>
      <Tag8 />
    </div>
  );
}

function Wrap14() {
  return (
    <div className="content-stretch flex gap-[24px] items-center px-[4px] relative shrink-0" data-name="wrap">
      <Wrap15 />
      <div className="flex h-[20px] items-center justify-center relative shrink-0 w-0">
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[20px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 1">
                <line id="Line 30" stroke="var(--stroke-0, #121212)" x2="20" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <Wrap16 />
    </div>
  );
}

function Component1Line() {
  return (
    <div className="bg-[rgba(255,183,59,0.2)] relative rounded-[5px] shrink-0 w-full" data-name="1-line">
      <div aria-hidden className="absolute border border-[var(--accent)] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[10px] relative size-full">
          <p className="[word-break:break-word] flex-[1_0_0] font-['SUIT:Bold',sans-serif] leading-[normal] min-w-px not-italic overflow-hidden relative text-[16px] text-black text-ellipsis whitespace-nowrap">“계절의 경계에서 피어나는 섬세한 감정선”</p>
        </div>
      </div>
    </div>
  );
}

function Wrap10() {
  return (
    <div className="flex-[1_0_0] h-full min-w-px relative" data-name="Wrap">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-between py-[8px] relative size-full">
          <Title />
          <Wrap11 />
          <Wrap14 />
          <Component1Line />
        </div>
      </div>
    </div>
  );
}

function Wrap9() {
  return (
    <div className="content-stretch flex gap-[24px] h-[212px] items-center relative shrink-0 w-[759px]" data-name="Wrap">
      <Image />
      <Wrap10 />
    </div>
  );
}

function Image1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Image">
      <div aria-hidden className="absolute border-[#121212] border-[2.4px] border-solid inset-[-2.4px] pointer-events-none" />
      <div className="h-[208px] relative shrink-0 w-[156px]" data-name="image 48">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage48} />
      </div>
    </div>
  );
}

function Title1() {
  return (
    <div className="content-stretch flex h-[35px] items-center max-h-[35px] relative shrink-0 w-full" data-name="Title">
      <p className="[word-break:break-word] flex-[1_0_0] font-['Elice_DX_Neolli_OTF:Medium',sans-serif] h-full leading-[1.25] min-w-px not-italic overflow-hidden relative text-[#121212] text-[28px] text-ellipsis whitespace-nowrap">날 보러와요</p>
    </div>
  );
}

function TdesignLocationFilled1() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="tdesign:location-filled">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="tdesign:location-filled">
          <path d={svgPaths.p29da5b00} fill="var(--fill-0, #121212)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IconLocation1() {
  return (
    <div className="overflow-clip relative rounded-[699.3px] shrink-0 size-[24px]" data-name="Icon_Location">
      <TdesignLocationFilled1 />
    </div>
  );
}

function Wrap20() {
  return (
    <div className="relative shrink-0 w-full" data-name="Wrap">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[6px] items-center pr-[4px] relative size-full">
          <IconLocation1 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['SUIT:Medium',sans-serif] leading-[normal] min-w-px not-italic overflow-hidden relative text-[16px] text-black text-ellipsis whitespace-nowrap">충무아트센터 중극장 블랙</p>
        </div>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[12.5%_12.5%_0.77%_12.5%]" data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.6 14.5705">
        <g id="Group">
          <g id="Vector" />
          <path d={svgPaths.p9916500} fill="var(--fill-0, #121212)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function MingcuteCalendarFill1() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 overflow-clip size-[16.8px] top-1/2" data-name="mingcute:calendar-fill">
      <Group1 />
    </div>
  );
}

function IconCalendar1() {
  return (
    <div className="overflow-clip relative rounded-[699.3px] shrink-0 size-[24px]" data-name="Icon_Calendar">
      <MingcuteCalendarFill1 />
    </div>
  );
}

function Wrap21() {
  return (
    <div className="relative shrink-0 w-full" data-name="Wrap">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[6px] items-center pr-[4px] relative size-full">
          <IconCalendar1 />
          <p className="[word-break:break-word] font-['SUIT:Medium',sans-serif] leading-[normal] not-italic overflow-hidden relative shrink-0 text-[#121212] text-[16px] text-ellipsis whitespace-nowrap">2026.05.23 ~ 2026.08.02</p>
        </div>
      </div>
    </div>
  );
}

function Wrap19() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-full" data-name="Wrap">
      <Wrap20 />
      <Wrap21 />
    </div>
  );
}

function Tag9() {
  return (
    <div className="bg-white content-stretch flex h-[30px] items-center justify-center px-[12px] py-[6px] relative rounded-[999px] shrink-0" data-name="Tag">
      <div aria-hidden className="absolute border-[#121212] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['SUIT:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#121212] text-[14px] whitespace-nowrap">1시간 30분</p>
    </div>
  );
}

function Wrap23() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="wrap">
      <p className="[word-break:break-word] font-['SUIT:ExtraBold',sans-serif] leading-[normal] not-italic overflow-hidden relative shrink-0 text-[#121212] text-[14px] text-ellipsis whitespace-nowrap">러닝타임</p>
      <Tag9 />
    </div>
  );
}

function Tag10() {
  return (
    <div className="bg-[#c3ff83] content-stretch flex items-center justify-center px-[10px] py-[6px] relative rounded-[999px] shrink-0 size-[30px]" data-name="Tag">
      <div aria-hidden className="absolute border-[#121212] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <p className="[word-break:break-word] font-['SUIT:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#121212] text-[14px] whitespace-nowrap">12</p>
    </div>
  );
}

function Wrap24() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="wrap">
      <p className="[word-break:break-word] font-['SUIT:ExtraBold',sans-serif] leading-[normal] not-italic overflow-hidden relative shrink-0 text-[#121212] text-[14px] text-ellipsis whitespace-nowrap">관람연령</p>
      <Tag10 />
    </div>
  );
}

function Wrap22() {
  return (
    <div className="content-stretch flex gap-[24px] items-center px-[4px] relative shrink-0" data-name="wrap">
      <Wrap23 />
      <div className="flex h-[20px] items-center justify-center relative shrink-0 w-0">
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[20px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 1">
                <line id="Line 30" stroke="var(--stroke-0, #121212)" x2="20" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <Wrap24 />
    </div>
  );
}

function Component1Line1() {
  return (
    <div className="bg-[rgba(255,183,59,0.2)] relative rounded-[5px] shrink-0 w-full" data-name="1-line">
      <div aria-hidden className="absolute border border-[var(--accent)] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[10px] relative size-full">
          <p className="[word-break:break-word] flex-[1_0_0] font-['SUIT:Bold',sans-serif] leading-[normal] min-w-px not-italic overflow-hidden relative text-[16px] text-black text-ellipsis whitespace-nowrap">“계절의 경계에서 피어나는 섬세한 감정선”</p>
        </div>
      </div>
    </div>
  );
}

function Wrap18() {
  return (
    <div className="flex-[1_0_0] h-full min-w-px relative" data-name="Wrap">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-between py-[8px] relative size-full">
          <Title1 />
          <Wrap19 />
          <Wrap22 />
          <Component1Line1 />
        </div>
      </div>
    </div>
  );
}

function Wrap17() {
  return (
    <div className="content-stretch flex gap-[24px] h-[212px] items-center relative shrink-0 w-[759px]" data-name="Wrap">
      <Image1 />
      <Wrap18 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute left-[-10px] size-[53.922px] top-[-8.92px]">
      <div className="absolute left-0 size-[53.922px] top-0">
        <div className="absolute inset-[0_0.76%_3.02%_0.76%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 53.1024 52.2956">
            <path d={svgPaths.p2066ca72} fill="var(--fill-0, var(--accent))" id="Star 13" stroke="var(--stroke-0, black)" strokeWidth="1.61765" />
          </svg>
        </div>
      </div>
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['SUIT:ExtraBold',sans-serif] leading-[normal] left-[calc(50%+0.09px)] not-italic text-[#121212] text-[15.098px] text-center top-[calc(50%-9.17px)] whitespace-nowrap">1</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute left-[-8.92px] size-[53.922px] top-[265px]">
      <div className="absolute left-0 size-[53.922px] top-0">
        <div className="absolute inset-[0_0.76%_3.02%_0.76%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 53.1024 52.2956">
            <path d={svgPaths.p2066ca72} fill="var(--fill-0, var(--accent))" id="Star 13" stroke="var(--stroke-0, black)" strokeWidth="1.61765" />
          </svg>
        </div>
      </div>
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['SUIT:ExtraBold',sans-serif] leading-[normal] left-[calc(50%+0.19px)] not-italic text-[#121212] text-[15.098px] text-center top-[calc(50%-9.17px)] whitespace-nowrap">2</p>
    </div>
  );
}

function Wrap8() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[30px] items-start left-[447px] pb-[100px] pt-[24px] px-[24px] rounded-tl-[12px] rounded-tr-[12px] top-[39px]" data-name="wrap">
      <div aria-hidden className="absolute border-[#121212] border-[2.5px] border-solid inset-0 pointer-events-none rounded-tl-[12px] rounded-tr-[12px]" />
      <Wrap9 />
      <div className="h-0 relative shrink-0 w-[759px]">
        <div className="absolute inset-[-1.5px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 759 1.5">
            <line id="Line 33" stroke="var(--stroke-0, #121212)" strokeWidth="1.5" x2="759" y1="0.75" y2="0.75" />
          </svg>
        </div>
      </div>
      <Wrap17 />
      <Frame1 />
      <Frame2 />
    </div>
  );
}

function Contents() {
  return (
    <div className="absolute h-[594px] left-[159px] overflow-clip top-[126px] w-[1254px]" data-name="Contents">
      <Wrap2 />
      <Wrap8 />
      <div className="absolute h-0 left-[424px] top-[107px] w-[25px]">
        <div className="absolute inset-[-10px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 10">
            <line id="Line 34" stroke="var(--stroke-0, #121212)" strokeWidth="10" x2="25" y1="5" y2="5" />
          </svg>
        </div>
      </div>
      <div className="absolute h-0 left-[424px] top-[261px] w-[25px]">
        <div className="absolute inset-[-10px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 10">
            <line id="Line 34" stroke="var(--stroke-0, #121212)" strokeWidth="10" x2="25" y1="5" y2="5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function Component({
  source = "서울연극센터",
  content = CURATION.seoul,
  edit,
}: { data?: unknown; source?: string; content?: CurationContent; edit?: CurationEdit } = {}) {
  return (
    <div className="bg-[#f7f8f9] relative size-full" data-name="연극1~5">
      <Frame />
      <Frame3 source={source} />
      <DContents content={content} edit={edit} />
    </div>
  );
}