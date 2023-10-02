import { useContext } from 'react';
import AuthenticationContext from '@/contexts/AuthenticationContext';

const useAuthData = () => useContext(AuthenticationContext);

export { useAuthData };
export default useAuthData;