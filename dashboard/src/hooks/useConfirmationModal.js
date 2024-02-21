import { useContext } from 'react';
import ConfirmationModalContext from '@/contexts/ConfirmationModalContext';

const useConfirmationModal = () => useContext(ConfirmationModalContext);

export { useConfirmationModal };
export default useConfirmationModal;