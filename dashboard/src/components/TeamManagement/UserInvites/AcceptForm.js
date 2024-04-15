import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/LoadingSpinner';
import { setAuthToken } from '@/lib/auth';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { UserPlusIcon } from '@heroicons/react/20/solid';
import useAuthData from '@/hooks/useAuthData'
import { useState } from 'react'
import { swishjam } from '@swishjam/react';

export default function AcceptForm({ userInvite }) {
  const { email: loggedInUserEmail } = useAuthData();
  const [currentView, setCurrentView] = useState(userInvite.invited_email_is_existing_user ? 'login' : 'register');
  const [email, setEmail] = useState(userInvite.invited_email);
  const [errorMsg, setErrorMsg] = useState();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState();

  const acceptInviteAsLoggedInUser = async e => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg();
    const { user, error, auth_token } = await SwishjamAPI.WorkspaceInvitations.accept(userInvite.invite_token, { acceptance_method: 'existing' });
    if (error) {
      setLoading(false);
      setErrorMsg(error);
    } else {
      swishjam.identify(user.id, { email: user.email })
      swishjam.event('workspace_invitation_accepted', {
        workspace_id: userInvite?.workspace?.id,
        workspace_name: userInvite?.workspace?.name,
        invited_by_user: userInvite?.invited_by_user?.email,
        accepted_by_user: loggedInUserEmail,
        acceptance_method: 'existing'
      })
      setAuthToken(auth_token);
      window.location.href = '/';
    }
  }

  const acceptInviteAsLoggedOutUser = async e => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg();
    const { user, error, auth_token } = await SwishjamAPI.WorkspaceInvitations.accept(userInvite.invite_token, { email, password, acceptance_method: currentView });
    if (error) {
      setLoading(false);
      setErrorMsg(error);
    } else {
      swishjam.identify(user.id, { email: user.email })
      swishjam.event('workspace_invitation_accepted', {
        workspace_id: userInvite?.workspace?.id,
        workspace_name: userInvite?.workspace?.name,
        invited_by_user: userInvite?.invited_by_user?.email,
        accepted_by_user: email,
        acceptance_method: 'new'
      })
      setAuthToken(auth_token);
      window.location = '/';
    }
  }

  return (
    <div className="bg-white py-8 px-4 sm:border sm:rounded-lg sm:px-10 shadow-sm">
      <div className="flex items-center mb-6 text-gray-900 text-sm bg-slate-50 rounded py-2 px-4 border border-slate-300">
        <UserPlusIcon className='h-6 w-6 mr-2 flex-shrink-0' />
        <span className='flex-grow px-2'>
          <span className='font-medium'>{userInvite.invited_by_user.email}</span> has invited you to join the <span className='font-medium'>{userInvite.workspace.name}</span> workspace on Swishjam.
        </span>
      </div>
      {loggedInUserEmail
        ? (
          <>
            {loggedInUserEmail !== email && (
              <div className="flex items-center bg-yellow-50 text-yellow-700 text-xs mb-4 rounded-md p-4 mt-2">
                <ExclamationCircleIcon className='h-5 w-5 inline-block mr-2 flex-shrink-0' />
                <span className='flex-grow'>
                  This invitation was intended for <span className='font-medium'>{userInvite.invited_email}</span>, but you are logged in as <span className='font-medium'>{loggedInUserEmail}</span>.
                </span>
              </div>
            )}
            <h2 className="text-xl mb-6 text-gray-900">Welcome back, <span className='font-medium'>{loggedInUserEmail}</span></h2>
            {errorMsg && <div className="text-red-600 text-sm text-center mb-2">{errorMsg}</div>}
            <button
              className={`w-full mt-6 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${loading ? 'bg-gray-400' : 'bg-swishjam hover:bg-swishjam-dark'}`}
              disabled={loading}
              onClick={acceptInviteAsLoggedInUser}
            >
              {loading ? <div className="h-6"><LoadingSpinner size={6} color='white' /></div> : 'Accept Invite'}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl mb-6 text-gray-900">{currentView === 'register' ? 'Register' : 'Sign into your account'}</h2>
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
                    : currentView === 'register'
                      ? 'Register and Accept Invite'
                      : 'Login and Accept Invite'}
                </button>
              </div>
            </form>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg border-t border-gray-200 pt-8 text-center">
              <p className="text-sm text-gray-600">
                {currentView === 'register' ? 'Already have an account?' : 'Need an account?'}
                <span
                  className="font-medium text-swishjam hover:text-swishjam-dark ml-1 cursor-pointer"
                  onClick={() => {
                    setPassword('')
                    setCurrentView(currentView === 'register' ? 'login' : 'register')
                  }}
                >
                  {currentView === 'register' ? 'Sign in' : 'Sign up'}
                </span>
              </p>
            </div>
          </>
        )
      }
    </div >
  )
}