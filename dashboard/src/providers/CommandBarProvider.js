'use client';

import { useState } from 'react';
import CommandBarContext from '@/contexts/CommandBarContext';
import CommandBar from '@/components/CommandBar/Modal'
import { swishjam } from '@swishjam/react';

const CommandBarProvider = ({ children }) => {
  const [displayCommandBar, setCommandBarIsOpen] = useState(false);

  const onCommandBarOpenedChange = opened => {
    if (opened) {
      swishjam.event('command_bar_opened')
    }
    setCommandBarIsOpen(opened);
  }

  return (
    <CommandBarContext.Provider value={{ setCommandBarIsOpen: onCommandBarOpenedChange }}>
      {displayCommandBar && <CommandBar onClose={() => setCommandBarIsOpen(false)} />}
      {children}
    </CommandBarContext.Provider>
  );
}

export { CommandBarProvider };
export default CommandBarProvider;