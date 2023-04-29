'use client';
import Header from '@components/Header';
import Sidebar from '@components/Sidebar';
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
        <NoProjectsView />
      </>
    )
  } else if (user) {
    return(
      <>
        <Sidebar />
        <main className="py-10 lg:pl-72">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main> 
        
      </>
    );
  } else if (!initial && !user) {
    return (<SignIn />)
  } else {
    // This is back up for now... 
    return (<LoadingFullScreen />);
  } 
}