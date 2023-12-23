'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCommandBar } from '@/hooks/useCommandBar';
import HotKeyModal from '@/components/HotKeys/Modal';
import { swishjam } from '@swishjam/react';

const HotKeyProvider = ({ children }) => {
  const router = useRouter();
  const [hotKeyModalIsOpen, setHotKeyModalIsOpen] = useState(false);

  if (!useCommandBar) throw new Error('HotKeyProvider must be nested within the CommandBarProvider.');
  const { setCommandBarIsOpen } = useCommandBar();

  const onHotKey = (key, action) => {
    swishjam.event('hot_key_pressed', { key });
    action();
  }

  const hotKeyActions = {
    ',': () => onHotKey(',', () => router.push('/settings')),
    '/': () => onHotKey('/', () => setHotKeyModalIsOpen(true)),
    k: () => onHotKey('k', () => setCommandBarIsOpen(true)),
    u: () => onHotKey('u', () => router.push('/users')),
    o: () => onHotKey('o', () => router.push('/organizations')),
    h: () => onHotKey('h', () => router.push('/')),
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
          { key: 'k', description: 'Open command bar' },
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