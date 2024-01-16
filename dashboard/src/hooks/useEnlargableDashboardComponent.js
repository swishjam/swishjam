import { useContext } from 'react';
import EnlargableDashboardComponentContext from '@/contexts/EnlargableDashboardComponentContext';

const useEnlargableDashboardComponent = () => useContext(EnlargableDashboardComponentContext);

export { useEnlargableDashboardComponent };
export default useEnlargableDashboardComponent;