'use client';
import Header from '@components/Header';
import { useAuth } from '@components/AuthProvider';
import LoadingFullScreen from '@components/LoadingFullScreen';
import SignIn from '@components/Auth/SignIn';
import NoProjectsView from './NoProjectsView';

export default function AuthenticatedView({ children }) {
  const { initial, user, currentProject } = useAuth();
  if (initial) {
    return (<LoadingFullScreen />);
  } else if(user && !currentProject) {
    return (
      <>
        <Header />
        <NoProjectsView />
      </>
    )
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