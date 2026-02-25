/**
 * Add-In Context Provider
 * Manages MyGeotab API integration and credentials
 */

import { createContext, useContext, ReactNode } from 'react';

interface AddInContextType {
  api: any; // MyGeotab API instance
  state: any; // MyGeotab state
  credentials: {
    database: string;
    userName: string;
    sessionId: string;
  };
}

const AddInContext = createContext<AddInContextType | undefined>(undefined);

export function AddInProvider({
  api,
  state,
  children
}: {
  api: any;
  state: any;
  children: ReactNode;
}) {
  const value = {
    api,
    state,
    credentials: {
      database: state?.database || 'demo',
      userName: state?.userName || 'user@example.com',
      sessionId: state?.sessionId || 'mock-session'
    }
  };

  return (
    <AddInContext.Provider value={value}>
      {children}
    </AddInContext.Provider>
  );
}

export function useAddInContext() {
  const context = useContext(AddInContext);
  if (!context) {
    throw new Error('useAddInContext must be used within AddInProvider');
  }
  return context;
}
