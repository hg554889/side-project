import React, { createContext, useContext, useState, useReducer } from 'react';

// Initial state
const initialState = {
  user: null,
  currentPage: 'main',
  searchQuery: '',
  filters: {
    experience: '',
    region: '',
    companySize: '',
  },
  analysisSettings: {
    jobCategory: '',
    subCategory: '',
    experienceLevel: '',
    companySize: '',
  },
  analysisResults: null,
  loading: false,
  error: null,
};

// Actions
const ACTIONS = {
  SET_PAGE: 'SET_PAGE',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  SET_ANALYSIS_SETTINGS: 'SET_ANALYSIS_SETTINGS',
  SET_ANALYSIS_RESULTS: 'SET_ANALYSIS_RESULTS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_PAGE:
      return { ...state, currentPage: action.payload };
    case ACTIONS.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    case ACTIONS.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case ACTIONS.SET_ANALYSIS_SETTINGS:
      return {
        ...state,
        analysisSettings: { ...state.analysisSettings, ...action.payload },
      };
    case ACTIONS.SET_ANALYSIS_RESULTS:
      return { ...state, analysisResults: action.payload };
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const actions = {
    setPage: (page) => dispatch({ type: ACTIONS.SET_PAGE, payload: page }),
    setSearchQuery: (query) =>
      dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query }),
    setFilters: (filters) =>
      dispatch({ type: ACTIONS.SET_FILTERS, payload: filters }),
    setAnalysisSettings: (settings) =>
      dispatch({ type: ACTIONS.SET_ANALYSIS_SETTINGS, payload: settings }),
    setAnalysisResults: (results) =>
      dispatch({ type: ACTIONS.SET_ANALYSIS_RESULTS, payload: results }),
    setLoading: (loading) =>
      dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ACTIONS.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: ACTIONS.CLEAR_ERROR }),
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;
