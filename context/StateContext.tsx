"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import initialDatenstruktur from '@/data/datenstrukturWithDummyData.json';
import { Datenstruktur } from '@/types/datenstruktur'; // You might need to create this type file

interface StateContextType {
  datenstruktur: Datenstruktur;
  setDatenstruktur: React.Dispatch<React.SetStateAction<Datenstruktur>>;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export function StateProvider({ children }: { children: ReactNode }) {
  const [datenstruktur, setDatenstruktur] = useState<Datenstruktur>(() => {
    // Try to load from localStorage on initial render
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('datenstruktur');
      if (saved) {
        return JSON.parse(saved) as Datenstruktur;
      }
    }
    // Fall back to initial data if not found in localStorage
    return initialDatenstruktur as Datenstruktur;
  });

  useEffect(() => {
    // Save to localStorage whenever datenstruktur changes
    if (Object.keys(datenstruktur).length > 0) {
      localStorage.setItem('datenstruktur', JSON.stringify(datenstruktur));
    }
  }, [datenstruktur]);

  return (
    <StateContext.Provider value={{ datenstruktur, setDatenstruktur }}>
      {children}
    </StateContext.Provider>
  );
}

export function useStateContext() {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useStateContext must be used within a StateProvider');
  }
  return context;
}