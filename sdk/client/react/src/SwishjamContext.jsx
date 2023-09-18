import { createContext, useContext } from 'react';

export const SwishjamContext = createContext();
export const useSwishjam = () => useContext(SwishjamContext);