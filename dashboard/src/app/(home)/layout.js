import { AuthenticationProvider } from '@/components/Auth/AuthenticationProvider'
import AuthenticatedView from '@/components/Auth/AuthenticatedView';
import LoadingView from './LoadingView';

export default function layout({ children }) {
  return (
    <AuthenticationProvider>
      <AuthenticatedView>
        {children}
      </AuthenticatedView>
    </AuthenticationProvider>
  )
} 