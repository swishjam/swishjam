'use client';

import AutomationBuilderContext from '@/contexts/AutomationBuilderContext';
import { useState } from 'react';

const AutomationBuilderProvider = ({ children }) => {
  const [selectedEntryPointEventName, setSelectedEntryPointEventName] = useState();

  return (
    <AutomationBuilderContext.Provider value={{ setSelectedEntryPointEventName, selectedEntryPointEventName }}>
      {children}
    </AutomationBuilderContext.Provider>
  );
}

export { AutomationBuilderProvider };
export default AutomationBuilderProvider;