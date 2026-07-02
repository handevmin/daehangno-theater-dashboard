// 극캐감별사 — "내가 만약 연극 속 주인공이라면?"
// smore.im/quiz/dFjTONPgd9 의 문항/결과 데이터를 그대로 옮긴 것.
// (원본 결과 카피의 오타 "환상이 케미" 포함, 있는 그대로 유지)

export type CharKey =
  | "hamlet" | "macbeth" | "romeo" | "oedipus"
  | "nora" | "antigone" | "falstaff" | "faust";

export interface QuizOption {
  /** 보기 문구 (줄바꿈은 
) */
  text: string;
  /** 이 보기를 고르면 점수가 쌓이는 캐릭터 */
  char: CharKey;
}

export interface QuizQuestion {
  q: string;
  options: QuizOption[];
}

export interface Chemistry {
  label: string;
  char: CharKey;
}

export interface CharResult {
  key: CharKey;
  name: string;
  /** 결과 상단 한 줄 소개 */
  topTitle: string;
  /** 인용구 (줄 단위) */
  quote: string[];
  /** 인용구 출처 */
  source: string;
  /** 설명 문단 */
  description: string[];
  chemGood: Chemistry;
  chemBad: Chemistry;
}

export const KO_TO_KEY: Record<string, CharKey> = {
  "햄릿": "hamlet",
  "맥베스": "macbeth",
  "로미오": "romeo",
  "오이디푸스": "oedipus",
  "노라": "nora",
  "안티고네": "antigone",
  "팔스타프": "falstaff",
  "파우스트": "faust"
};

export const META = {
  title: "극캐감별사",
  subtitle: "내가 만약 연극 속 주인공이라면?",
  keyColor: "#efba12",
  loadingText: "결과 분석중",
  loadingDelay: 4000,
  startButton: "테스트 시작하기",
  restartText: "다시 시작하기",
} as const;

export const QUESTIONS: QuizQuestion[] = [
  {
    q: "인생의 큰 갈림길, 중요한 결정을 앞둔 당신은?",
    options: [
      { text: "\"만약에..\"로 시작해서 모든\n시나리오를 다 써야 직성이 풀린다", char: "hamlet" },
      { text: "아.묻.따. 심장이 시키는 대로 저지른다", char: "romeo" },
      { text: "남들이 뭐라든 내가 맞다고\n생각하면 그냥 직진", char: "antigone" },
      { text: "팝콘각! 그 순간 제일 재밌어\n보이는 쪽으로 간다", char: "falstaff" },
    ],
  },
  {
    q: "내 인생에서 절대 포기 못 하는 것은?",
    options: [
      { text: "진실\n찝찝한 건 못 참아, 팩트가 제일 중요해", char: "oedipus" },
      { text: "성공\n무조건 정상 찍고 내려다볼 거야", char: "macbeth" },
      { text: "자유\n누구 눈치도 안 보고 나답게 사는 것", char: "nora" },
      { text: "열망\n내 한계를 깨부수고 더 높은 곳으로", char: "faust" },
    ],
  },
  {
    q: "친구가 \"너 요즘 좀 변한 것 같아\"라고 한다면?",
    options: [
      { text: "\"내가? 왜? 언제부터?\" \n내 행동을 하나하나 되짚어본다", char: "hamlet" },
      { text: "\"사람은 원래 변하지.\" 쿨하게\n인정하고 지금 나를 즐긴다", char: "nora" },
      { text: "\"성공하려면 이 정도는 변해야지.\"\n목표를 위해서라면 OK", char: "macbeth" },
      { text: "\"맛있는 거 먹으러 갈래?\"\n변했든 말든 지금 즐거우면 됐지", char: "falstaff" },
    ],
  },
  {
    q: "불합리한 규칙이나 노답 상황을 마주쳤을 때?",
    options: [
      { text: "\"이건 아니죠.\" 손해 봐도 할 말은\n하고 정면으로 맞선다", char: "antigone" },
      { text: "\"왜 이렇게 된 거지?\" 인과관계부터 분석하고 본다", char: "oedipus" },
      { text: "\"오히려 좋아.\" 나한테 유리하게\n판을 뒤집어버린다", char: "faust" },
      { text: "\"뭐 어때~\" 대충 넘기고 퇴근 후 놀 생각한다", char: "falstaff" },
    ],
  },
  {
    q: "내가 꿈꾸는 나의 최종 모습은?",
    options: [
      { text: "아직 찾는 중, 인생은 끝없는 퀘스트지", char: "hamlet" },
      { text: "사랑하는 사람만 곁에 있다면\n어디든 지상낙원", char: "romeo" },
      { text: "누구의 무엇도 아닌, 온전한 '진짜 나’", char: "nora" },
      { text: "한 분야를 완전히 씹어먹는 괴물 같은 능력자", char: "faust" },
    ],
  },
  {
    q: "믿었던 사람에게 뒤통수를 맞았을 때?",
    options: [
      { text: "\"어디서부터 거짓말이야?\" 증거\n다 찾아서 진실을 밝혀야 풀린다", char: "oedipus" },
      { text: "\"어떻게 나한테 이래?\" 배신감을\n정의 구현으로 갚아준다", char: "antigone" },
      { text: "\"그럴 수 있지~\" 맛있는 거 먹고\n노래방에서 푼다", char: "falstaff" },
      { text: "\"조상신이 도왔다.\" 미련 없이\n다른 사람을 찾는다", char: "faust" },
    ],
  },
  {
    q: "새 프로젝트를 시작할 때 나의 스타일은?",
    options: [
      { text: "계획만 짜다가 에너지 다 씀,\n시작이 제일 무섭다", char: "hamlet" },
      { text: "일단 저지르고 수습은 미래의 나에게 맡긴다", char: "romeo" },
      { text: "1단계부터 10단계까지 완벽 세팅,\n무조건 성공이 목표", char: "macbeth" },
      { text: "내 신념에 꽂히면 계획 없어도\n바로 들이받는다", char: "antigone" },
    ],
  },
  {
    q: "누군가 나의 앞길을 방해한다면?",
    options: [
      { text: "저 사람의 의도부터 분석해본다", char: "hamlet" },
      { text: "협상을 해서라도 내 갈 길을 간다", char: "faust" },
      { text: "정면 승부, 방해꾼은 가차 없이 치우고 간다", char: "macbeth" },
      { text: "싸우기 귀찮으니까 무시하고 돌아서 간다", char: "falstaff" },
    ],
  },
  {
    q: "가장 이불킥이 나오는 후회의 순간은?",
    options: [
      { text: "눈치 못 채고 바보같이 속았던 순간", char: "oedipus" },
      { text: "사랑에 올인하지 못해 놓쳐버린 그 사람", char: "romeo" },
      { text: "성공하느라 소중한 사람들을 밀어냈던 순간", char: "macbeth" },
      { text: "눈치 보느라 정작 내가 하고\n싶은 걸 참았던 순간", char: "nora" },
    ],
  },
  {
    q: "내 평판에 대한 나의 태도는?",
    options: [
      { text: "하루 종일 신경 쓰임, 주변에 물어보게 됨", char: "hamlet" },
      { text: "\"그래서 뭐 어쩌라고?\" 내 소신이\n제일 중요해", char: "antigone" },
      { text: "전략적으로 관리함, 평판도 하나의 도구다", char: "faust" },
      { text: "관심 없음, 지금 내 눈앞의\n즐거움이 제일 중요해", char: "falstaff" },
    ],
  },
  {
    q: "미친 듯한 사랑이 찾아온다면?",
    options: [
      { text: "앞뒤 계산 없이 직진, 완전한 불나방 스타일", char: "romeo" },
      { text: "사랑도 좋지만 내 커리어를\n방해하는 건 안 됨", char: "macbeth" },
      { text: "연애는 연애고 나는 나, 선 넘는 간섭은 거부", char: "nora" },
      { text: "\"우리가 진짜 운명일까?\" 밤새도록\n이 관계를 고뇌한다", char: "hamlet" },
    ],
  },
  {
    q: "나를 움직이는 최고의 도파민은?",
    options: [
      { text: "숨겨진 진실을 알아냈을 때의 짜릿함", char: "oedipus" },
      { text: "지금보다 훨씬 멋진 나로\n성장하고 싶은 욕구", char: "faust" },
      { text: "눈치 안 보고 신념대로 행동했을 때의 쾌감", char: "antigone" },
      { text: "어떤 상황에서도 유머를 잃지 않고\n즐길 때의 행복", char: "falstaff" },
    ],
  },
];

export const RESULTS: Record<CharKey, CharResult> = {
  faust: {
    key: "faust",
    name: "파우스트",
    topTitle: "한계를 넘어서는 초월자",
    quote: [
      "“멈추어라, 순간이여! 참으로 아름답구나!”",
    ],
    source: "괴테 『파우스트』",
    description: [
      " 당신은 현재의 성취에 안주하는 것을 경계하며, 끊임없이 지평을 넓히고 새로운 세계를 갈구하는 열망의 소유자입니다. 당신에게 삶은 끝없는 학습과 탐구의 연속이며, 어제보다 더 넓은 세계를 경험해야만 비로소 만족을 느낍니다. 지적 호기심과 성취욕이 결합된 당신의 추진력은 남들이 상상하지 못한 창의적인 결과물을 세상에 내놓게 만듭니다.",
      " 하지만 늘 '더 높은 곳'만 바라보느라 지금 당신 곁에 머무는 소소한 행복을 정체라고 오해하며 스스로를 채찍질하곤 합니다. 가끔은 멈춰 서서 지금 이 순간이 얼마나 아름다운지 느낄 수 있는 여유를 가져보세요. 순간 속에 깃든 영원함을 발견하고 음미할 줄 알게 될 때, 당신의 그칠 줄 모르는 탐구 여정은 비로소 완전한 평안에 이르게 될 것입니다.",
    ],
    chemGood: { label: "환상의 케미", char: "nora" },
    chemBad: { label: "파멸의 케미", char: "falstaff" },
  },
  falstaff: {
    key: "falstaff",
    name: "팔스타프",
    topTitle: "현재를 즐기는 감각주의자",
    quote: [
      "“명예가 무엇이냐? 한낱 말일 뿐.",
      "그 말 속에 무엇이 있느냐? 공기뿐이다”",
    ],
    source: "윌리엄 셰익스피어 『헨리 4세』",
    description: [
      " 당신은 추상적인 관념이나 무거운 책임감에 억눌리기보다, 지금 이 순간 느끼는 확실한 행복을 가장 소중히 여기는 삶의 예술가입니다. 맛있는 음식, 유쾌한 농담, 포근한 휴식처럼 손에 잡히는 즐거움을 온전히 누릴 줄 아는 당신의 능력은 각박한 세상 속에서 매우 희귀하고 귀한 재능입니다. 당신의 낙천적인 에너지는 주변의 긴장을 완화해주며 사람들에게 다시 시작할 힘을 주는 쉼터가 됩니다.",
      " 다만, 눈앞의 즐거움에만 몰입하다 보니 장기적인 계획이나 반드시 지켜야 할 약속들을 가볍게 여겨 신뢰를 잃을 수도 있습니다. 즐거움이라는 이름의 도피가 아닌, 내일을 위한 최소한의 책임감을 당신의 삶에 한 스푼 섞어보세요. 당신이 가진 에너지가 미래를 향한 책임감과 만날 때, 당신은 단순한 방관자를 넘어 사람들에게 행복의 길을 안내하는 가장 매력적인 주인공이 될 것입니다.",
    ],
    chemGood: { label: "환상의 케미", char: "romeo" },
    chemBad: { label: "파멸의 케미", char: "faust" },
  },
  antigone: {
    key: "antigone",
    name: "안티고네",
    topTitle: "단단하고 고결한 신념가",
    quote: [
      "“허나 나는 그를 묻겠노라—",
      "설령 죽음을 맞이한다 하여도, ",
      "이 죄가 곧 성스러운 일이라 단언하노라”",
    ],
    source: "소포클레스 『안티고네』",
    description: [
      " 당신은 대중의 유행이나 권위의 압박에도 흔들리지 않는, 대리석처럼 단단한 원칙과 신념을 지닌 수호자입니다. 당신에게 인생은 이득을 따지는 게임이 아니라 지켜야 할 가치를 수호하는 과정이며, 이를 위해 소수가 되는 외로움이나 현실적인 손해를 기꺼이 감수합니다. 당신의 흔들리지 않는 기준은 혼란스러운 시대에 무엇이 정말로 중요한지 일깨워주는 이정표가 됩니다.",
      " 다만, 자신의 신념이 너무 강력한 나머지 다른 가치관을 배척하거나 스스로를 가혹한 도덕적 잣대에 가두어 고통받을 위험이 있습니다. 유연함은 신념에 대한 배신이 아니라, 더 큰 정의를 담기 위한 그릇의 확장임을 받아들여 보세요. 당신의 고결함에 타인의 불완전함을 품어주는 부드러움이 더해질 때, 비로소 당신의 신념은 세상을 변화시키는 진정한 울림이 될 것입니다.",
    ],
    chemGood: { label: "환상의 케미", char: "macbeth" },
    chemBad: { label: "파멸의 케미", char: "nora" },
  },
  nora: {
    key: "nora",
    name: "노라",
    topTitle: "삶을 개척하는 독립가",
    quote: [
      "“전 이제 제 자신을 알아야 해요.",
      "저에게는 제 인생이 있어요”",
    ],
    source: "헨리크 입센 『인형의 집』",
    description: [
      " 당신은 타인의 시선이나 사회가 요구하는 역할에 갇히기를 거부하며, 오직 스스로 선택한 길을 개척하고자 하는 독립적인 영혼입니다. 누군가의 부속품으로 살기보다 '진정한 나'를 찾는 여정에 최고의 가치를 두며, 이를 위해 안락한 환경조차 과감히 포기할 수 있는 용기가 있습니다. 변화를 두려워하지 않고 자아를 확장해 나가는 당신의 모습은 주변에 건강한 자극을 줍니다.",
      " 하지만 자아를 찾는 과정에서의 단호함이 자칫 소중한 관계를 단칼에 베어버리거나 주변의 조언을 간섭으로 오해하게 만들 수도 있습니다. 진정한 독립은 고립이 아니라, 타인과 연결된 채로도 나 자신을 잃지 않는 단단함에서 나옵니다. 주변과 소통하며 당신의 자유를 확장해 나가는 법을 익히세요. 당신이 열고 나간 문 밖의 세상은 타인과 함께할 때 더욱 넓고 다채로워질 것입니다.",
    ],
    chemGood: { label: "환상이 케미", char: "faust" },
    chemBad: { label: "파멸의 케미", char: "antigone" },
  },
  oedipus: {
    key: "oedipus",
    name: "오이디푸스",
    topTitle: "진실을 향해 나아가는 탐구자",
    quote: [
      "“나는 모든 것을 알아야겠소.",
      "마침내 진실을 보아야만 하오.",
      "그것이 나를 파멸시킬지라도!”",
    ],
    source: "소포클레스 『오이디푸스 왕』",
    description: [
      " 당신은 모호하고 불확실한 상태를 견디지 못하며, 어떤 상황에서도 본질과 진실을 파헤쳐야 직성이 풀리는 강인한 정신의 소유자입니다. 뛰어난 관찰력과 집요한 논리로 무장한 당신은 남들이 놓치는 단서에서 거대한 진실을 찾아내며 문제를 해결하는 데 탁월한 능력을 발휘합니다. 당신은 세상이 정해준 답을 믿기보다, 고통스럽더라도 자신의 눈으로 확인한 사실을 믿습니다.",
      " 다만, 모든 것을 명확한 인과관계로 정의하려는 태도가 주변 사람들에게는 냉정하거나 독선적으로 보일 수 있습니다. 세상에는 때로 논리로 설명되지 않는 회색 지대와 침묵해야 할 슬픔이 존재함을 기억하세요. 진실을 찾는 예리한 칼날에 타인의 아픔을 어루만지는 따뜻함을 한 방울 섞는다면, 당신은 진실을 찾는 자를 넘어 사람들의 마음을 움직이는 진정한 리더가 될 것입니다.",
    ],
    chemGood: { label: "환상의 케미", char: "hamlet" },
    chemBad: { label: "파멸의 케미", char: "romeo" },
  },
  romeo: {
    key: "romeo",
    name: "로미오",
    topTitle: "순수하고 뜨거운 로맨티스트",
    quote: [
      "“아, 저기 창문으로 비쳐오는",
      "빛은 무엇인가?",
      "저곳이 동쪽이라면",
      "줄리엣은 태양이로구나!”",
    ],
    source: "윌리엄 셰익스피어 『로미오와 줄리엣』",
    description: [
      " 당신은 냉철한 논리보다는 가슴의 뜨거운 울림을 삶의 나침반으로 삼는 사람입니다. 사랑, 우정, 혹은 당신이 매료된 어떤 이상에 대해 계산 없이 전부를 던지는 몰입력은 당신만이 가진 고결한 재능입니다. 당신에게 인생은 건조한 사실들의 나열이 아니라, 매 순간 온몸으로 통과해야 할 한 편의 뜨거운 서정시와도 같습니다.",
      " 그러나 감정의 파도가 너무 가파르게 몰아칠 때면 현실적인 판단력이 흐려져 자신과 소중한 사람들을 위태롭게 만들기도 합니다. 격정적인 감정에 휘말려 결론을 내리기 전, 잠시 숨을 고르며 차가운 이성의 시간을 의도적으로 가져보세요. 당신의 뜨거운 진심에 객관적인 안전장치를 더한다면, 당신의 삶은 비극적인 짧은 불꽃이 아니라 오래도록 온기를 전하는 태양이 될 것입니다.",
    ],
    chemGood: { label: "환상의 케미", char: "falstaff" },
    chemBad: { label: "파멸의 케미", char: "oedipus" },
  },
  macbeth: {
    key: "macbeth",
    name: "맥베스",
    topTitle: "야망으로 불타는 승부사",
    quote: [
      "“별들이여, 빛을 감추어라!",
      "나의 검고 깊은 야망은 비추지 말거라.”",
    ],
    source: "윌리엄 셰익스피어 『맥베스』",
    description: [
      " 당신은 자신이 원하는 것이 무엇인지 정확히 알고, 그것을 쟁취하기 위해 온 에너지를 투입하는 뜨거운 실행가입니다. 목표가 정해지면 주저함 없이 달려가는 당신의 추진력은 정체된 일상에 활력을 불어넣으며 주변 사람들에게 강렬한 자극을 주곤 합니다. 당신에게 삶은 정복해야 할 무대이며, 스스로의 한계를 시험하고 증명해 내는 과정에서 가장 뜨거운 생동감을 느낍니다.",
      " 하지만 앞만 보고 달리는 속도가 너무 빠를 때, 당신의 야망은 주변의 헌신이나 당신 자신의 평온함까지 태워버릴 수 있습니다. 승리 뒤에 찾아올 허무함을 경계하고, 가끔은 속도를 늦추어 '성취'가 아닌 '과정'의 아름다움을 돌아보세요. 주변의 손을 잡고 함께 올라가는 법을 배운다면, 당신이 쓴 왕관은 그 어떤 풍파에도 흔들리지 않을 만큼 견고하고 명예로워질 것입니다.",
    ],
    chemGood: { label: "환상의 케미", char: "antigone" },
    chemBad: { label: "파멸의 케미", char: "hamlet" },
  },
  hamlet: {
    key: "hamlet",
    name: "햄릿",
    topTitle: "신중하고 깊이 있는 사색가",
    quote: [
      "“죽느냐 사느냐, 그것이 문제로다”",
    ],
    source: "윌리엄 셰익스피어 『햄릿』",
    description: [
      " 당신은 현상 너머에 숨겨진 본질을 끊임없이 질문하고 탐구하는 사유의 소유자입니다. 어떤 결정을 내리기 전, 발생 가능한 모든 변수를 시뮬레이션하고 내밀한 정당성을 검토하기에 당신의 내면은 누구보다 섬세한 지도로 가득 차 있습니다. 이러한 신중함은 당신을 실수 없는 전략가로 만들며, 남들이 보지 못하는 사건의 이면을 꿰뚫어 보게 합니다.",
      " 다만, 완벽한 확신을 얻으려다 '생각의 감옥'에 갇혀 실행의 타이밍을 놓치거나 스스로를 고립시킬 위험이 있습니다. 때로는 정답이 없는 문제 앞에서 괴로워하기보다, 불완전한 행동이 아무것도 하지 않는 것보다 낫다는 사실을 받아들여 보세요. 당신의 깊은 사유가 행동이라는 날개를 달 때, 비로소 세상은 당신이 설계한 위대한 지도를 목격하게 될 것입니다.",
    ],
    chemGood: { label: "환상의 케미", char: "oedipus" },
    chemBad: { label: "파멸의 케미", char: "macbeth" },
  },
};

/** 결과 산출: 각 보기가 가리키는 캐릭터에 1점씩. 최고점이 결과.
 * 동점이면 문항에서 먼저 등장(선택)한 캐릭터가 우선. */
export function computeResult(picks: CharKey[]): CharKey {
  const score = {} as Record<CharKey, number>;
  const firstSeen = {} as Record<CharKey, number>;
  picks.forEach((c, i) => {
    score[c] = (score[c] ?? 0) + 1;
    if (firstSeen[c] === undefined) firstSeen[c] = i;
  });
  let best: CharKey = picks[0];
  for (const c of Object.keys(score) as CharKey[]) {
    if (
      score[c] > score[best] ||
      (score[c] === score[best] && firstSeen[c] < firstSeen[best])
    ) {
      best = c;
    }
  }
  return best;
}

/** public/quiz 자산 경로 헬퍼 */
export const fullImg = (k: CharKey) => `/quiz/full/${k}.jpg`;
export const circleImg = (k: CharKey) => `/quiz/circle/${k}.png`;
export const COVER_IMG = "/quiz/cover.png";
