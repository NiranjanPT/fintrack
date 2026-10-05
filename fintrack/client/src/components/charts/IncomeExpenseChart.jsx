import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_COLORS, axisProps, tooltipStyle } from '../../utils/chartTheme';
import { formatCompact, formatCurrency } from '../../utils/format';

// Grouped bars: income vs expense per month
export default function IncomeExpenseChart({ data, height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} axisLine={false} tickFormatter={formatCompact} width={64} />
        <Tooltip
          {...tooltipStyle}
          cursor={{ fill: 'rgba(42, 120, 214, 0.06)' }}
          formatter={(value, name) => [formatCurrency(value), name]}
        />
        <Legend itemSorter={null} verticalAlign="top" align="right" iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 13, paddingBottom: 8 }} />
        <Bar dataKey="income" name="Income" fill={CHART_COLORS.income} radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="expense" name="Expense" fill={CHART_COLORS.expense} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
