'use client';
import Header from '@components/Header';
import { useAuth, VIEWS } from '@components/AuthProvider';
import LoadingFullScreen from '@components/LoadingFullScreen';
import SignIn from '@components/Auth/SignIn';

export default function AuthenticatedView({ children }) {
  const { initial, user, view } = useAuth();

  //console.log('authenticated view data', initial, user, view)
  if (initial) {
    return (<LoadingFullScreen />);
  } else if (user) {
    return(
      <>
        <Header />
        {children}
      </>
    );
  } else if (!initial && !user) {
    return (<SignIn />)
  } else {
    // This is back up for now... 
    return (<LoadingFullScreen />);
  } 
}