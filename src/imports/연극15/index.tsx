import { TopPlaysScreen } from "../../app/components/TopPlaysScreen";
import type { DashboardData } from "../../app/lib/kopis";

export default function Component({ data }: { data: DashboardData }) {
  return <TopPlaysScreen data={data} start={0} count={5} title="오늘의 대학로 연극 Top 1~5위" />;
}
