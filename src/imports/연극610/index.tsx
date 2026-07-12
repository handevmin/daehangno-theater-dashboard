import { TopPlaysScreen } from "../../app/components/TopPlaysScreen";
import type { DashboardData } from "../../app/lib/kopis";

export default function Component({ data }: { data: DashboardData }) {
  return <TopPlaysScreen data={data} start={5} count={5} title="이번주 대학로 연극 Top 6~10위" />;
}
