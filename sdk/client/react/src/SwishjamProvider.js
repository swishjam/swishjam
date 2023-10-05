'use client'

import { useState, useEffect } from 'react';
import { SwishjamContext } from './SwishjamContext';

export const SwishjamProvider = ({ apiKey, apiEndpoint, children }) => {
  const [swishjamClient, setSwishjamClient] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined' && !swishjamClient && !window.Swishjam) {
        const SwishjamClient = (await import('@swishjam/core')).default;
        const client = new SwishjamClient({ apiKey, apiEndpoint });
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