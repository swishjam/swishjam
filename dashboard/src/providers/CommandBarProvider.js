'use client';

import { useEffect, useState } from 'react';
import CommandBarContext from '@/contexts/CommandBarContext';
import CommandBar from '@/components/CommandBar/Modal'

const CommandBarProvider = ({ children }) => {
  const [displayCommandBar, setCommandBarIsOpen] = useState(false);

  useEffect(() => {
    window.addEventListener('keydown', (event) => {
      if (event.metaKey && event.key === 'k') {
        setCommandBarIsOpen(true);
      }
    });
  }, [])

  return (
    <CommandBarContext.Provider value={{ setCommandBarIsOpen: setCommandBarIsOpen }}>
      {displayCommandBar && <CommandBar onClose={() => setCommandBarIsOpen(false) } />}
      {children}
    </CommandBarContext.Provider>
  );
}

export { CommandBarProvider };
export default CommandBarProvider;