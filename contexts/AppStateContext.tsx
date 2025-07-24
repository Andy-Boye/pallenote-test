import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface AppStateContextType {
  selectedNotebookId: string | null;
  setSelectedNotebookId: (id: string | null) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);

  return (
    <AppStateContext.Provider value={{ selectedNotebookId, setSelectedNotebookId }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};
