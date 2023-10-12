import { createContext, useContext } from 'react';
export var SwishjamContext = createContext(undefined);
export var useSwishjam = function () { return useContext(SwishjamContext); };
