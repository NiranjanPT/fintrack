// Experiment 8 - Context API: finance state shared between pages
// (selected month/year, categories and budget alerts)
import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react';
import categoryService from '../services/categoryService';
import budgetService from '../services/budgetService';

export const FinanceContext = createContext(null);

const now = new Date();

const initialState = {
  selectedMonth: now.getMonth() + 1,
  selectedYear: now.getFullYear(),
  categories: [],
  categoriesLoading: true,
  budgetAlerts: [],
  refreshKey: 0, // increased after any change so dependent data reloads
};

export function financeReducer(state, action) {
  switch (action.type) {
    case 'SET_MONTH':
      return { ...state, selectedMonth: action.payload };
    case 'SET_YEAR':
      return { ...state, selectedYear: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload, categoriesLoading: false };
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload].sort((a, b) => a.name.localeCompare(b.name)),
      };
    case 'SET_ALERTS':
      return { ...state, budgetAlerts: action.payload };
    case 'REFRESH':
      return { ...state, refreshKey: state.refreshKey + 1 };
    default:
      return state;
  }
}

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const { selectedMonth, selectedYear, refreshKey } = state;

  const loadCategories = useCallback(async () => {
    try {
      const categories = await categoryService.getAll();
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
    } catch {
      dispatch({ type: 'SET_CATEGORIES', payload: [] });
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Budget alerts for the selected month - shown in the Navbar
  useEffect(() => {
    let ignore = false;
    budgetService
      .getAlerts(selectedMonth, selectedYear)
      .then((alerts) => !ignore && dispatch({ type: 'SET_ALERTS', payload: alerts }))
      .catch(() => !ignore && dispatch({ type: 'SET_ALERTS', payload: [] }));
    return () => {
      ignore = true;
    };
  }, [selectedMonth, selectedYear, refreshKey]);

  const setMonth = useCallback((month) => dispatch({ type: 'SET_MONTH', payload: Number(month) }), []);
  const setYear = useCallback((year) => dispatch({ type: 'SET_YEAR', payload: Number(year) }), []);
  const refreshData = useCallback(() => dispatch({ type: 'REFRESH' }), []);

  const addCategory = useCallback(async (name, type) => {
    const category = await categoryService.create({ name, type });
    dispatch({ type: 'ADD_CATEGORY', payload: category });
    return category;
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      expenseCategories: state.categories.filter((c) => c.type === 'expense'),
      incomeCategories: state.categories.filter((c) => c.type === 'income'),
      setMonth,
      setYear,
      refreshData,
      addCategory,
      reloadCategories: loadCategories,
    }),
    [state, setMonth, setYear, refreshData, addCategory, loadCategories]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}
