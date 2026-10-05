import { useState } from 'react';
import Card from '../components/Card';
import Icon from '../components/Icon';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import PeriodSelector from '../components/PeriodSelector';
import useFinance from '../hooks/useFinance';
import useFetch from '../hooks/useFetch';
import reportService from '../services/reportService';
import { capitalize, formatCurrency, formatDate, formatPercent } from '../utils/format';

// Data from GET /api/reports?month=&year= ; CSV from GET /api/reports/export
export default function Reports() {
  const { selectedMonth, selectedYear } = useFinance();

  // Local state: the report period can also be a full year ("all" months)
  const [month, setMonth] = useState(String(selectedMonth));
  const [year, setYear] = useState(String(selectedYear));
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [exportError, setExportError] = useState('');

  const { data: report, loading, error, refetch } = useFetch(() => reportService.getReport(month, year), [month, year]);

  const handleExport = async () => {
    setExporting(true);
    setExportError('');
    setExportMessage('');
    try {
      const fileName = await reportService.exportCSV(month, year);
      setExportMessage(`Downloaded ${fileName}`);
    } catch (err) {
      setExportError(err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Financial Report</h2>
          <p className="muted">
            {report ? report.period.label : 'Loading...'}
            {loading && report && <span className="spinner small" />}
          </p>
        </div>
        <div className="header-actions">
          <PeriodSelector month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} allowAllMonths />
          <button className="btn btn-primary" onClick={handleExport} disabled={exporting || !report}>
            <Icon name="download" size={16} /> {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <ErrorMessage message={exportError} />
      {exportMessage && (
        <div className="notice notice-success" role="status">
          <Icon name="check" size={18} />
          <span>{exportMessage}</span>
        </div>
      )}

      {loading && !report ? (
        <Loading message="Generating report..." />
      ) : error && !report ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : (
        <>
          <div className="stats-grid">
            <StatCard label="Total Income" value={formatCurrency(report.summary.income)} icon="arrowDown" tone="blue" />
            <StatCard label="Total Expenses" value={formatCurrency(report.summary.expenses)} icon="arrowUp" tone="orange" />
            <StatCard
              label="Savings"
              value={formatCurrency(report.summary.savings)}
              icon="piggy"
              tone={report.summary.savings >= 0 ? 'green' : 'red'}
              hint={`Savings rate ${formatPercent(report.summary.savingsRate)}`}
            />
            <StatCard
              label="Subscriptions"
              value={formatCurrency(report.subscriptions.periodTotal)}
              icon="subscriptions"
              tone="violet"
              hint={`${formatCurrency(report.subscriptions.monthlyTotal)} per month`}
            />
          </div>

          <div className="grid-2">
            <Card title="Category-wise Expenses">
              {report.categoryExpenses.length ? (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th className="text-right">Amount</th>
                        <th className="text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.categoryExpenses.map((row) => (
                        <tr key={row.category}>
                          <td>{row.category}</td>
                          <td className="text-right">{formatCurrency(row.total)}</td>
                          <td className="text-right">{formatPercent(row.percentage)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td>Total</td>
                        <td className="text-right">{formatCurrency(report.summary.expenses)}</td>
                        <td className="text-right">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <EmptyState icon="reports" title="No expenses in this period" />
              )}
            </Card>

            <Card title="Income Sources">
              {report.incomeSources.length ? (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th className="text-right">Amount</th>
                        <th className="text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.incomeSources.map((row) => (
                        <tr key={row.category}>
                          <td>{row.category}</td>
                          <td className="text-right">{formatCurrency(row.total)}</td>
                          <td className="text-right">{formatPercent(row.percentage)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon="reports" title="No income in this period" />
              )}
            </Card>
          </div>

          <Card
            title="Budget Information"
            subtitle={
              report.budgets.length
                ? `${formatCurrency(report.budgetSummary.totalSpent)} spent of ${formatCurrency(report.budgetSummary.totalLimit)} budgeted`
                : undefined
            }
          >
            {report.budgets.length ? (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Category</th>
                      <th className="text-right">Limit</th>
                      <th className="text-right">Spent</th>
                      <th className="text-right">Remaining</th>
                      <th className="text-right">Used</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.budgets.map((b) => (
                      <tr key={b._id}>
                        <td className="nowrap">{b.period}</td>
                        <td>{b.category?.name}</td>
                        <td className="text-right">{formatCurrency(b.limit)}</td>
                        <td className="text-right">{formatCurrency(b.spent)}</td>
                        <td className="text-right">{formatCurrency(b.remaining)}</td>
                        <td className="text-right">{formatPercent(b.percentage)}</td>
                        <td>
                          <StatusBadge status={b.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon="budget" title="No budgets in this period" />
            )}
          </Card>

          <div className="grid-2">
            <Card title="Subscription Expenses" subtitle={`${report.subscriptions.activeCount} active · ${formatCurrency(report.subscriptions.yearlyTotal)} per year`}>
              {report.subscriptions.items.length ? (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Cycle</th>
                        <th className="text-right">Amount</th>
                        <th className="text-right">Per month</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.subscriptions.items.map((s) => (
                        <tr key={s._id}>
                          <td>{s.name}</td>
                          <td>{capitalize(s.billingCycle)}</td>
                          <td className="text-right">{formatCurrency(s.amount)}</td>
                          <td className="text-right">{formatCurrency(s.monthlyCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3}>Monthly total</td>
                        <td className="text-right">{formatCurrency(report.subscriptions.monthlyTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <EmptyState icon="subscriptions" title="No active subscriptions" />
              )}
            </Card>

            <Card title="Savings Goals" subtitle={`${formatCurrency(report.savingsGoals.summary.totalSaved)} saved of ${formatCurrency(report.savingsGoals.summary.totalTarget)}`}>
              {report.savingsGoals.items.length ? (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Goal</th>
                        <th className="text-right">Saved</th>
                        <th className="text-right">Target</th>
                        <th className="text-right">Progress</th>
                        <th>Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.savingsGoals.items.map((g) => (
                        <tr key={g._id}>
                          <td>{g.name}</td>
                          <td className="text-right">{formatCurrency(g.currentAmount)}</td>
                          <td className="text-right">{formatCurrency(g.targetAmount)}</td>
                          <td className="text-right">{g.progress}%</td>
                          <td className="nowrap">{formatDate(g.deadline)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon="savings" title="No savings goals" />
              )}
            </Card>
          </div>

          <p className="muted small-print">Generated {new Date(report.generatedAt).toLocaleString('en-IN')} · {report.summary.transactionCount} transactions in this period</p>
        </>
      )}
    </div>
  );
}
