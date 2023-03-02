'use client';
import Header from '@components/Header';
import Auth from '@components/Auth';
import LoadingFullScreen from '@components/LoadingFullScreen';
import { useAuth, VIEWS } from '@components/AuthProvider';

export default function AuthenticatedView({ children }) {
  const { initial, user, view, signOut } = useAuth();

  console.log('authenticated view data', initial, user, view)

  if (initial) {
    return <LoadingFullScreen />;
  } else if (view === VIEWS.UPDATE_PASSWORD) {
    return <Auth view={view} />;
  } else if (user) {
    return(
      <>
        <Header />
        {children}
      </>
    );
  } else {
    return <Auth view={view} />;
  }
}