'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCommandBar } from '@/hooks/useCommandBar';
import HotKeyModal from '@/components/HotKeys/Modal';

const HotKeyProvider = ({ children }) => {
  const router = useRouter();
  const [hotKeyModalIsOpen, setHotKeyModalIsOpen] = useState(false);

  if (!useCommandBar) throw new Error('HotKeyProvider must be nested within the CommandBarProvider.');
  const { setCommandBarIsOpen } = useCommandBar();

  const hotKeyActions = {
    ',': () => router.push('/settings'),
    '/': () => setHotKeyModalIsOpen(true),
    k: () => setCommandBarIsOpen(true),
    u: () => router.push('/users'),
    o: () => router.push('/organizations'),
    h: () => router.push('/'),
  }

  useEffect(() => {
    window.addEventListener('keydown', event => {
      if (event.metaKey) {
        const actionForHotKey = hotKeyActions[event.key];
        if (actionForHotKey) {
          event.preventDefault();
          actionForHotKey();
        }
      }
    });
  }, [])

  return (
    <>
      <HotKeyModal 
        isOpen={hotKeyModalIsOpen} 
        onClose={() => setHotKeyModalIsOpen(false)} 
        descriptions={[
          { key: ',', description: 'Navigate to settings' },
          { key: 'u', description: 'Navigate to users list page' },
          { key: 'o', description: 'Navigate to organizations list page' },
          { key: 'h', description: 'Navigate to home page' },
          { key: '/', description: 'Open hot key settings' },
        ]}
      />
      {children}
    </>
  );
}

export { HotKeyProvider };
export default HotKeyProvider;