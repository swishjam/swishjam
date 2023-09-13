import { useEffect, createContext, useContext } from 'react';

const SwishjamContext = createContext();

export const useSwishjam = () => useContext(SwishjamContext);

export const SwishjamProvider = ({ apiKey, apiEndpoint, children }) => {
  let swishjamClient;

  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined' && !swishjamClient) {
        swishjamClient = (await import('@swishjam/core')).default;
        swishjamClient.init({ apiKey, apiEndpoint });
        return swishjamClient;
      }
    }
    init();
  }, [apiKey, apiEndpoint]);

  return (
    <SwishjamContext.Provider value={swishjamClient}>
      {children}
    </SwishjamContext.Provider>
  );
}