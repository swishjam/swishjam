import { useContext } from 'react';
import CommonQueriesContext from '@/contexts/CommonQueriesContext';

const useCommonQueries = () => useContext(CommonQueriesContext);

export { useCommonQueries };
export default useCommonQueries;