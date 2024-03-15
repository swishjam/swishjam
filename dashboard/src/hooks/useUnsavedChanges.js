import { useContext } from 'react';
import UnsavedChangesContext from '@/contexts/UnsavedChangesContext';

const useUnsavedChanges = () => useContext(UnsavedChangesContext);

export { useUnsavedChanges };
export default useUnsavedChanges;