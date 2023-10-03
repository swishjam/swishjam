import { useContext } from 'react';
import CommandBarContext from '@/contexts/CommandBarContext';

const useCommandBar = () => useContext(CommandBarContext);

export { useCommandBar };
export default useCommandBar;