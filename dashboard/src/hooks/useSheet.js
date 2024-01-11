import { useContext } from 'react';
import SheetContext from '@/contexts/SheetContext';

const useSheet = () => useContext(SheetContext);

export { useSheet };
export default useSheet;