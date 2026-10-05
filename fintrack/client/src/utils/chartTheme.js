// Chart colors (validated categorical palette) and shared Recharts styling
export const CHART_COLORS = {
  income: '#2a78d6', // blue  - series slot 1
  expense: '#eb6834', // orange - series slot 2
  grid: '#e1e0d9',
  axis: '#898781',
  text: '#52514e',
};

export const axisProps = {
  stroke: CHART_COLORS.axis,
  tick: { fill: CHART_COLORS.axis, fontSize: 12 },
  tickLine: false,
  axisLine: { stroke: '#c3c2b7' },
};

export const tooltipStyle = {
  contentStyle: {
    background: '#ffffff',
    border: '1px solid rgba(11, 11, 11, 0.1)',
    borderRadius: 8,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    fontSize: 13,
  },
  labelStyle: { color: '#0b0b0b', fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: '#52514e' },
};
