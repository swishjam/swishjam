import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/LoadingSpinner';
import { setAuthToken } from '@/lib/auth';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import useAuthData from '@/hooks/useAuthData'
import { useState } from 'react'

export default function AcceptForm({ userInvite }) {
  const { email: loggedInUserEmail } = useAuthData();
  const [currentView, setCurrentView] = useState('register');
  const [email, setEmail] = useState(userInvite.invited_email);
  const [errorMsg, setErrorMsg] = useState();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState();

  const acceptInviteAsLoggedInUser = async e => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg();
    const { error, auth_token } = await SwishjamAPI.WorkspaceInvitations.accept(userInvite.invite_token, { acceptance_method: 'existing' });
    if (error) {
      setLoading(false);
      setErrorMsg(error);
    } else {
      setAuthToken(auth_token);
      window.location.href = '/';
    }
  }

  const acceptInviteAsLoggedOutUser = async e => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg();
    const { error, auth_token } = await SwishjamAPI.WorkspaceInvitations.accept(userInvite.invite_token, { email, password, acceptance_method: currentView });
    if (error) {
      setLoading(false);
      setErrorMsg(error);
    } else {
      setAuthToken(auth_token);
      window.location = '/';
    }
  }

  return (
    <div className="bg-white py-8 px-4 sm:border sm:rounded-lg sm:px-10 shadow-sm">
      {loggedInUserEmail
        ? (
          <>
            <h2 className="text-lg text-gray-900 text-center">
              <span className='font-medium'>{userInvite.invited_by_user.email}</span> has invited you to join the <span className='font-medium'>{userInvite.workspace.name}</span> workspace on Swishjam.
            </h2>
            {loggedInUserEmail !== email && (
              <div className="flex items-center justify-center bg-yellow-50 text-yellow-700 text-sm mb-4 rounded-md p-4 mt-2">
                <ExclamationCircleIcon className='h-5 w-5 inline-block mr-2' />
                <span>This invitation was intended for <span className='font-medium'>{userInvite.invited_email}</span>.</span>
              </div>
            )}
            {errorMsg && <div className="text-red-600 text-sm text-center mb-2">{errorMsg}</div>}
            <button
              className={`w-full mt-6 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${loading ? 'bg-gray-400' : 'bg-swishjam hover:bg-swishjam-dark'}`}
              disabled={loading}
              onClick={acceptInviteAsLoggedInUser}
            >
              {loading
                ? <div className="h-6"><LoadingSpinner size={6} color='white' /></div>
                : 'Accept Invite'}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-lg mb-6 text-gray-900 text-center">
              <span className='font-medium'>{userInvite.invited_by_user.email}</span> has invited you to join the <span className='font-medium'>{userInvite.workspace.name}</span> workspace on Swishjam.
            </h2>
            <form onSubmit={acceptInviteAsLoggedOutUser}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input type='email' className='input' value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>

              <div className='mt-2'>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input type='password' className='input' value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              </div>

              <div className='mt-4'>
                {errorMsg && <div className="text-red-600 text-sm text-center mb-2">{errorMsg}</div>}
                <button
                  type="submit"
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${loading ? 'bg-gray-400' : 'bg-swishjam hover:bg-swishjam-dark'}`}
                  disabled={loading}
                >
                  {loading
                    ? <div className="h-6"><LoadingSpinner size={6} color='white' /></div>
                    : currentView === 'register' ? 'Register and Accept Invite' : 'Login and Accept Invite'}
                </button>
              </div>
            </form>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
              <p className="text-sm text-gray-600">
                {currentView === 'register' ? 'Already have an account?' : 'Need an account?'}
                <span
                  className="font-medium text-swishjam hover:text-swishjam-dark ml-1 cursor-pointer"
                  onClick={() => setCurrentView(currentView === 'register' ? 'login' : 'register')}
                >
                  {currentView === 'register' ? 'Sign in' : 'Sign up'}
                </span>
              </p>
            </div>
          </>
        )
      }
    </div>
  )
}