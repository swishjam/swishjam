'use client'

import { createContext, useContext } from 'react';

export const SwishjamContext = createContext();
export const useSwishjam = () => {
  const context = useContext(SwishjamContext);
  if (!context) {
    throw new Error('`useSwishjam` must be used within a `<SwishjamProvider>` component.')
  }
  return context;
};