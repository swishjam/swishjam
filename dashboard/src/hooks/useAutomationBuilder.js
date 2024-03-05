import { useContext } from 'react';
import AutomationBuilderContext from '@/contexts/AutomationBuilderContext';

const useAutomationBuilder = () => useContext(AutomationBuilderContext);

export { useAutomationBuilder };
export default useAutomationBuilder;