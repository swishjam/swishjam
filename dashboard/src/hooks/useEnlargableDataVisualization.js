import { useContext } from 'react';
import EnlargableDataVisualizationContext from '@/contexts/EnlargableDataVisualizationContext';

const useEnlargableDataVisualization = () => useContext(EnlargableDataVisualizationContext);

export { useEnlargableDataVisualization };
export default useEnlargableDataVisualization;