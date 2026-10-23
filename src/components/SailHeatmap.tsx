import { ActivityHeatmap, type ActivityDatum } from "@/components/ui/activity-heatmap";

type Props = { data: ActivityDatum[]; days?: number };

export default function SailHeatmap({ data, days = 365 }: Props) {
  return (
    <ActivityHeatmap
      data={data}
      days={days}
      cellSize={12}
      color="var(--sea)"
      unit="nm"
      formatValue={(value) => (Number.isInteger(value) ? String(value) : value.toFixed(1))}
      autoPlay
      interval={3200}
    />
  );
}
