import { TopPlaysScreen } from "../../app/components/TopPlaysScreen";
import type { DashboardData } from "../../app/lib/kopis";

// 이번주 소극장 연극 Top 1~5위 (연극 + 1~300석 + 이번주 예매순위, 일반 연극순위 중복 제외; 서버 smallTop)
export default function Component({ data }: { data: DashboardData }) {
  return <TopPlaysScreen data={data} list={data.smallTop} start={0} count={5} title="이번주 소극장 연극 Top 1~5위" activeNode={3} />;
}
