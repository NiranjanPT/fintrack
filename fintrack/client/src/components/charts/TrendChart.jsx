import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_COLORS, axisProps, tooltipStyle } from '../../utils/chartTheme';
import { formatCompact, formatCurrency } from '../../utils/format';

/**
 * Line/area trend chart.
 * series: [{ key: 'expense', name: 'Expense', color: '#eb6834' }]
 */
export default function TrendChart({ data, xKey = 'label', series, height = 260, labelPrefix = '' }) {
  const showLegend = series.length > 1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
        <XAxis dataKey={xKey} {...axisProps} minTickGap={12} />
        <YAxis {...axisProps} axisLine={false} tickFormatter={formatCompact} width={64} />
        <Tooltip
          {...tooltipStyle}
          cursor={{ stroke: CHART_COLORS.axis, strokeDasharray: '4 4' }}
          labelFormatter={(label) => `${labelPrefix}${label}`}
          formatter={(value, name) => [formatCurrency(value), name]}
        />
        {showLegend && (
          <Legend itemSorter={null} verticalAlign="top" align="right" iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 13, paddingBottom: 8 }} />
        )}
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#fill-${s.key})`}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff' }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
