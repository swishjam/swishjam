'use client'

import { useState, useEffect } from 'react';
import { SwishjamContext } from './SwishjamContext';

export const SwishjamProvider = ({ children, ...options }) => {
  const [swishjamClient, setSwishjamClient] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined' && !swishjamClient && !window.Swishjam) {
        const SwishjamClient = (await import('@swishjam/core')).default;
        debugger;
        const client = new SwishjamClient(options);
        setSwishjamClient(client);
      }
    }
    init();
  }, []);

  return (
    <SwishjamContext.Provider value={swishjamClient}>
      {children}
    </SwishjamContext.Provider>
  );
}