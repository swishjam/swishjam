import { useState, useEffect } from 'react';
import { SwishjamContext } from './SwishjamContext';

export const SwishjamProvider = ({ apiKey, apiEndpoint, children }) => {
  const [swishjamClient, setSwishjamClient] = useState();

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