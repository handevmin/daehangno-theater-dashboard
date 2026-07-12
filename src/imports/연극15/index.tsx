import { TopPlaysScreen } from "../../app/components/TopPlaysScreen";
import type { DashboardData } from "../../app/lib/kopis";

export default function Component({ data }: { data: DashboardData }) {
  // 이번주 대학로 연극이 5편 이하라 6~10위가 없으면 "Top 1~5위" 대신 "Top 5" 로 표기
  const title =
    (data.top?.length ?? 0) > 5
      ? "이번주 대학로 연극 Top 1~5위"
      : "이번주 대학로 연극 Top 5";
  return <TopPlaysScreen data={data} start={0} count={5} title={title} />;
}
