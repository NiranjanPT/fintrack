import { useContext } from 'react';
import { FinanceContext } from '../context/FinanceContext';

// Custom hook to read the FinanceContext
export default function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used inside <FinanceProvider>');
  return context;
}
