import Card from '../components/Card';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import PeriodSelector from '../components/PeriodSelector';
import CategoryChart from '../components/charts/CategoryChart';
import TrendChart from '../components/charts/TrendChart';
import useFinance from '../hooks/useFinance';
import useFetch from '../hooks/useFetch';
import analyticsService from '../services/analyticsService';
import { CHART_COLORS } from '../utils/chartTheme';
import { MONTHS, formatCurrency, formatPercent } from '../utils/format';

const changeHint = (change, previousLabel) => {
  if (change === null || change === undefined) return `No data for ${previousLabel}`;
  const arrow = change > 0 ? '▲' : change < 0 ? '▼' : '';
  return `${arrow} ${formatPercent(Math.abs(change))} vs ${previousLabel}`;
};

// Data from GET /api/analytics/monthly?month=&year=
export default function Analytics() {
  // The selected month/year lives in FinanceContext, so it stays in sync with the Navbar selector
  const { selectedMonth, selectedYear, setMonth, setYear, refreshKey } = useFinance();

  const { data, loading, error, refetch } = useFetch(
    () => analyticsService.getMonthly(selectedMonth, selectedYear),
    [selectedMonth, selectedYear, refreshKey]
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Monthly Analytics</h2>
          <p className="muted">
            {MONTHS[selectedMonth - 1]} {selectedYear}
            {loading && data && <span className="spinner small" />}
          </p>
        </div>
        <PeriodSelector month={selectedMonth} year={selectedYear} onMonthChange={setMonth} onYearChange={setYear} />
      </div>

      {loading && !data ? (
        <Loading message="Calculating analytics..." />
      ) : error && !data ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              label="Monthly Income"
              value={formatCurrency(data.summary.income)}
              icon="arrowDown"
              tone="blue"
              hint={changeHint(data.changes.income, data.previous.label)}
            />
            <StatCard
              label="Monthly Expenses"
              value={formatCurrency(data.summary.expenses)}
              icon="arrowUp"
              tone="orange"
              hint={changeHint(data.changes.expenses, data.previous.label)}
            />
            <StatCard
              label="Monthly Savings"
              value={formatCurrency(data.summary.savings)}
              icon="piggy"
              tone={data.summary.savings >= 0 ? 'green' : 'red'}
              hint={`Savings rate ${formatPercent(data.summary.savingsRate)}`}
            />
            <StatCard
              label="Avg. Daily Spend"
              value={formatCurrency(data.summary.averageDailyExpense)}
              icon="calendar"
              tone="violet"
              hint={data.summary.topCategory ? `Top category: ${data.summary.topCategory}` : `${data.summary.transactionCount} transactions`}
            />
          </div>

          <div className="grid-2">
            <Card title="Category-wise Expenses" subtitle={data.period.label}>
              {data.categoryBreakdown.length ? (
                <CategoryChart data={data.categoryBreakdown} />
              ) : (
                <EmptyState icon="analytics" title="No expenses in this month" />
              )}
            </Card>

            <Card title="Category Breakdown" subtitle="Amount, share and number of transactions">
              {data.categoryBreakdown.length ? (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th className="text-right">Amount</th>
                        <th className="text-right">Share</th>
                        <th className="text-right">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.categoryBreakdown.map((row) => (
                        <tr key={row.category}>
                          <td>{row.category}</td>
                          <td className="text-right">{formatCurrency(row.total)}</td>
                          <td className="text-right">{formatPercent(row.percentage)}</td>
                          <td className="text-right">{row.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon="reports" title="Nothing to show" />
              )}
            </Card>
          </div>

          <Card title="Spending Trend" subtitle={`Daily expenses in ${data.period.label}`}>
            <TrendChart
              data={data.dailyTrend}
              xKey="day"
              labelPrefix={`${MONTHS[selectedMonth - 1].slice(0, 3)} `}
              series={[{ key: 'expense', name: 'Expenses', color: CHART_COLORS.expense }]}
            />
          </Card>

          <Card title="Income vs Expenses" subtitle="6 months up to the selected month">
            <TrendChart
              data={data.monthlyTrend}
              series={[
                { key: 'income', name: 'Income', color: CHART_COLORS.income },
                { key: 'expense', name: 'Expenses', color: CHART_COLORS.expense },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
}
