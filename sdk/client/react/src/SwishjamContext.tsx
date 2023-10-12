import { createContext, useContext } from 'react';

interface SwishjamContextValue {
  apiKey: string;
  apiEndpoint: string;
}

export const SwishjamContext = createContext<SwishjamContextValue | undefined>(undefined);
export const useSwishjam = () => useContext(SwishjamContext);