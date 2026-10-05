// Experiment 5 - React.js with React Router
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import Layout from './components/Layout';
import { FinanceProvider } from './context/FinanceContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Subscriptions from './pages/Subscriptions';
import SavingsGoals from './pages/SavingsGoals';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Private pages - require a valid JWT */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <FinanceProvider>
              <Layout />
            </FinanceProvider>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/savings" element={<SavingsGoals />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
