import { Link } from 'react-router-dom';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import TransactionTable from '../components/TransactionTable';
import BudgetCard from '../components/BudgetCard';
import SavingsGoalCard from '../components/SavingsGoalCard';
import StatusBadge from '../components/StatusBadge';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import CategoryChart from '../components/charts/CategoryChart';
import TrendChart from '../components/charts/TrendChart';
import useFinance from '../hooks/useFinance';
import useAuth from '../hooks/useAuth';
import useFetch from '../hooks/useFetch';
import analyticsService from '../services/analyticsService';
import { CHART_COLORS } from '../utils/chartTheme';
import { daysLabel, formatCurrency, formatDate } from '../utils/format';

// All numbers on this page come from GET /api/analytics/dashboard
export default function Dashboard() {
  const { user } = useAuth();
  const { selectedMonth, selectedYear, refreshKey } = useFinance();

  const { data, loading, error, refetch } = useFetch(
    () => analyticsService.getDashboard(selectedMonth, selectedYear),
    [selectedMonth, selectedYear, refreshKey]
  );

  if (loading && !data) return <Loading message="Loading dashboard..." />;
  if (error && !data) return <ErrorMessage message={error} onRetry={refetch} />;

  const { totals, thisMonth, recentTransactions, budgetStatus, upcomingSubscriptions, savingsGoals, charts, period } = data;
  const hasMonthExpenses = charts.expenseByCategory.length > 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Hello, {user?.name?.split(' ')[0]}</h2>
          <p className="muted">
            Overview for {period.label} · this month: {formatCurrency(thisMonth.income)} in, {formatCurrency(thisMonth.expenses)} out
          </p>
        </div>
        <Link to="/transactions" className="btn btn-primary">
          Add transaction
        </Link>
      </div>

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      <div className="stats-grid">
        <StatCard label="Total Income" value={formatCurrency(totals.totalIncome)} icon="arrowDown" tone="blue" />
        <StatCard label="Total Expenses" value={formatCurrency(totals.totalExpenses)} icon="arrowUp" tone="orange" />
        <StatCard
          label="Current Balance"
          value={formatCurrency(totals.currentBalance)}
          icon="wallet"
          tone={totals.currentBalance >= 0 ? 'green' : 'red'}
          hint="Income minus expenses"
        />
        <StatCard label="Total Savings" value={formatCurrency(totals.totalSavings)} icon="piggy" tone="violet" hint="Saved in goals" />
      </div>

      <div className="grid-2-1">
        <Card title="Income vs Expense" subtitle="Last 6 months">
          <IncomeExpenseChart data={charts.incomeVsExpense} />
        </Card>
        <Card title="Expense by Category" subtitle={period.label}>
          {hasMonthExpenses ? (
            <CategoryChart data={charts.expenseByCategory} />
          ) : (
            <EmptyState icon="analytics" title="No expenses this month" />
          )}
        </Card>
      </div>

      <Card title="Monthly Expense Trend" subtitle="Last 12 months">
        <TrendChart
          data={charts.monthlyExpenseTrend}
          series={[{ key: 'expense', name: 'Expenses', color: CHART_COLORS.expense }]}
        />
      </Card>

      <div className="grid-2">
        <Card title="Recent Transactions" action={<Link to="/transactions" className="link">View all</Link>}>
          {recentTransactions.length ? (
            <TransactionTable transactions={recentTransactions} compact />
          ) : (
            <EmptyState icon="transactions" title="No transactions yet" message="Add your first income or expense." />
          )}
        </Card>

        <Card title="Budget Status" subtitle={period.label} action={<Link to="/budgets" className="link">Manage</Link>}>
          {budgetStatus.length ? (
            <div className="stack">
              {budgetStatus.map((budget) => (
                <BudgetCard key={budget._id} budget={budget} compact />
              ))}
            </div>
          ) : (
            <EmptyState icon="budget" title="No budgets for this month" />
          )}
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Upcoming Subscriptions" action={<Link to="/subscriptions" className="link">View all</Link>}>
          {upcomingSubscriptions.length ? (
            <ul className="list">
              {upcomingSubscriptions.map((sub) => (
                <li key={sub._id} className="list-item">
                  <span className="sub-avatar small">{sub.name.charAt(0).toUpperCase()}</span>
                  <div className="list-main">
                    <strong>{sub.name}</strong>
                    <small className="muted">
                      {formatDate(sub.nextBillingDate)} · {daysLabel(sub.daysUntilBilling)}
                    </small>
                  </div>
                  <div className="list-side">
                    <strong>{formatCurrency(sub.amount)}</strong>
                    <StatusBadge status={sub.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="subscriptions" title="No active subscriptions" />
          )}
        </Card>

        <Card title="Savings Goals" action={<Link to="/savings" className="link">View all</Link>}>
          {savingsGoals.length ? (
            <div className="stack">
              {savingsGoals.map((goal) => (
                <SavingsGoalCard key={goal._id} goal={goal} compact />
              ))}
            </div>
          ) : (
            <EmptyState icon="savings" title="No savings goals yet" />
          )}
        </Card>
      </div>
    </div>
  );
}
