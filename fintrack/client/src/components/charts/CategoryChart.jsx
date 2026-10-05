import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_COLORS, axisProps, tooltipStyle } from '../../utils/chartTheme';
import { formatCompact, formatCurrency } from '../../utils/format';

const MAX_BARS = 8;

// Folds the smallest categories into "Others" so the chart stays readable
const prepare = (data) => {
  if (data.length <= MAX_BARS) return data;
  const top = data.slice(0, MAX_BARS - 1);
  const rest = data.slice(MAX_BARS - 1);
  return [
    ...top,
    {
      category: `Others (${rest.length})`,
      total: rest.reduce((sum, item) => sum + item.total, 0),
      percentage: rest.reduce((sum, item) => sum + item.percentage, 0),
    },
  ];
};

// Horizontal bars: expense amount per category (largest first)
export default function CategoryChart({ data, color = CHART_COLORS.expense }) {
  const rows = prepare(data);
  const height = rows.length * 38 + 24;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 56, left: 0, bottom: 0 }} barCategoryGap="25%">
        <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} />
        <XAxis type="number" {...axisProps} tickFormatter={formatCompact} hide />
        <YAxis type="category" dataKey="category" {...axisProps} axisLine={false} width={104} />
        <Tooltip
          {...tooltipStyle}
          cursor={{ fill: 'rgba(42, 120, 214, 0.06)' }}
          formatter={(value, name, item) => [`${formatCurrency(value)} (${item.payload.percentage.toFixed(1)}%)`, 'Spent']}
        />
        <Bar dataKey="total" name="Spent" fill={color} radius={[0, 4, 4, 0]} maxBarSize={22}>
          <LabelList dataKey="total" position="right" formatter={formatCompact} style={{ fill: CHART_COLORS.text, fontSize: 12 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
