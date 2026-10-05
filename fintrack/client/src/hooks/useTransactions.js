// Experiment 7 - useReducer: the Transactions page state (list, filters, pagination, loading, error)
import { useCallback, useEffect, useReducer, useState } from 'react';
import transactionService from '../services/transactionService';
import useDebounce from './useDebounce';

export const initialFilters = {
  search: '',
  type: '',
  category: '',
  paymentMethod: '',
  startDate: '',
  endDate: '',
  recurring: '',
};

const initialState = {
  transactions: [],
  pagination: { page: 1, pages: 1, total: 0, limit: 10 },
  totals: { income: 0, expense: 0, net: 0 },
  filters: initialFilters,
  page: 1,
  loading: true,
  error: '',
};

export function transactionReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS': {
      const { transactions, pagination, totals } = action.payload;
      return {
        ...state,
        loading: false,
        transactions,
        pagination,
        totals,
        // If the current page became empty (e.g. after a delete), go back one page
        page: state.page > pagination.pages ? pagination.pages : state.page,
      };
    }
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_FILTER':
      return { ...state, page: 1, filters: { ...state.filters, [action.payload.name]: action.payload.value } };
    case 'RESET_FILTERS':
      return { ...state, page: 1, filters: initialFilters };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    default:
      return state;
  }
}

export default function useTransactions(pageSize = 10) {
  const [state, dispatch] = useReducer(transactionReducer, initialState);
  const [reloadKey, setReloadKey] = useState(0);

  // Search is debounced so we don't call the API on every key press
  const debouncedSearch = useDebounce(state.filters.search, 400);
  const { search, ...otherFilters } = state.filters;
  const filterKey = JSON.stringify(otherFilters);

  useEffect(() => {
    let ignore = false;
    dispatch({ type: 'FETCH_START' });

    transactionService
      .getAll({ ...JSON.parse(filterKey), search: debouncedSearch, page: state.page, limit: pageSize })
      .then((data) => !ignore && dispatch({ type: 'FETCH_SUCCESS', payload: data }))
      .catch((err) => !ignore && dispatch({ type: 'FETCH_ERROR', payload: err.message }));

    return () => {
      ignore = true;
    };
  }, [filterKey, debouncedSearch, state.page, pageSize, reloadKey]);

  const setFilter = useCallback((name, value) => dispatch({ type: 'SET_FILTER', payload: { name, value } }), []);
  const resetFilters = useCallback(() => dispatch({ type: 'RESET_FILTERS' }), []);
  const setPage = useCallback((page) => dispatch({ type: 'SET_PAGE', payload: page }), []);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { ...state, isSearching: search !== debouncedSearch, setFilter, resetFilters, setPage, reload };
}
