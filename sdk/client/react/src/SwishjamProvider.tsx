import React, { useState, useEffect } from 'react';
import { SwishjamContext } from './SwishjamContext';

interface SwishjamProviderProps {
  apiKey: string;
  apiEndpoint: string;
  children: React.ReactNode;
}

export const SwishjamProvider: React.FC<SwishjamProviderProps> = ({ apiKey, apiEndpoint, children }) => {
  const [swishjamClient, setSwishjamClient] = useState<any>();

  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined' && !swishjamClient) {
        const SwishjamClient = (await import('@swishjam/core')).default;
        const client = new SwishjamClient({ apiKey, apiEndpoint });
        setSwishjamClient(client);
        return swishjamClient;
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