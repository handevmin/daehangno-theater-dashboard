import { TopPlaysScreen } from "../../app/components/TopPlaysScreen";
import type { DashboardData } from "../../app/lib/kopis";

export default function Component({ data }: { data: DashboardData }) {
  // 오늘 공연이 5편 이하라 6~10위가 없으면 "Top 1~5위" 대신 "Top 5" 로 표기
  const title =
    (data.top?.length ?? 0) > 5
      ? "오늘의 대학로 연극 Top 1~5위"
      : "오늘의 대학로 연극 Top 5";
  return <TopPlaysScreen data={data} start={0} count={5} title={title} />;
}
