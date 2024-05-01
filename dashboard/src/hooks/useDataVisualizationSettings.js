import { useContext } from 'react';
import DataVisualizationSettingsContext from '@/contexts/DataVisualizationSettingsContext';

const useDataVisualizationSettings = () => useContext(DataVisualizationSettingsContext);

export { useDataVisualizationSettings };
export default useDataVisualizationSettings;