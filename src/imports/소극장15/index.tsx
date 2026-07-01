import { TopPlaysScreen } from "../../app/components/TopPlaysScreen";
import type { DashboardData } from "../../app/lib/kopis";

// 오늘의 소극장 연극 Top 1~5위 (300석 미만 + 연극 + 오픈런 제외, 서버 smallTop)
export default function Component({ data }: { data: DashboardData }) {
  return <TopPlaysScreen data={data} list={data.smallTop} start={0} count={5} title="오늘의 소극장 연극 Top 1~5위" activeNode={3} />;
}
