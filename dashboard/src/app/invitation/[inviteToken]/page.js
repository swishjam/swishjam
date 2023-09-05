'use client';

import { useState, useEffect } from 'react';
import { API } from "@/lib/api-client/base";
import Logo from '@/components/Logo';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ONE_DAY_IN_MS } from '@/lib/utils/timeHelpers';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
// import supabase from '@/lib/supabase-browser';
// import { useAuth } from '@/components/Auth/AuthProvider';

export default function Invitation({ params }) {
  const { inviteToken } = params;
  // const { user: loggedInUser, updateCurrentOrganization } = useAuth();
  const [userInvite, setUserInvite] = useState();

  const isExpired = userInvite
                      ? new Date() - new Date(userInvite.created_at) > (parseInt(process.env.NEXT_PUBLIC_INVITE_EXPIRATION_DAYS || 14) * ONE_DAY_IN_MS)
                      : false;

  useEffect(() => {
    API.get('/api/user-invites/get', { inviteToken }).then(({ userInvite, error }) => setUserInvite(userInvite));
  }, [])

  return (
    <main>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
            <div className="mx-auto w-52">
              <Logo className="h-12 inline-block" words={true} />
            </div>
          </div>
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
            {userInvite 
              ? isExpired || userInvite.accepted_at
                ? <div className='text-center'>This user invite is no longer valid, please request a new one from your organization admin.</div>
                : <AcceptForm loggedInUser={loggedInUser} userInvite={userInvite} updateCurrentOrganization={updateCurrentOrganization} />
            : (
              <div className="bg-white py-12 px-8 border rounded-lg shadow-sm text-center">
                <div className='w-fit m-auto'>
                  <LoadingSpinner size={8} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function AcceptForm({ userInvite, loggedInUser, updateCurrentOrganization }) {
  const [currentView, setCurrentView] = useState('register');
  const [email, setEmail] = useState(userInvite.invited_email);
  const [password, setPassword] = useState();
  const [errorMsg, setErrorMsg] = useState();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const acceptInviteAsLoggedInUser = async e => {
    try {
      e.preventDefault();
      setLoading(true);
      setErrorMsg();

      const { error } = await API.post('/api/user-invites/accept', {
        userId: loggedInUser.id,
        inviteToken: userInvite.invite_token,
        methodOfAcceptance: 'logged-in'
      });
      if (error) {
        setLoading(false);
        setErrorMsg(error);
      } else {
        await updateCurrentOrganization(userInvite.organization);
        setSuccess(true);
        setTimeout(() => window.location.href = '/', 5_000);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message);
    }
  }


  const acceptInviteAsLoggedOutUser = async e => {
    try {
      e.preventDefault();
      setLoading(true);
      setErrorMsg();

      const { error } = await API.post('/api/user-invites/accept', {
        email,
        password,
        inviteToken: userInvite.invite_token,
        methodOfAcceptance: currentView
      });
      if (error) {
        setLoading(false);
        setErrorMsg(error);
      } else {
        // await supabase.auth.signInWithPassword({ email, password });
        await updateCurrentOrganization(userInvite.organization);
        setSuccess(true);
        setTimeout(() => window.location.href = '/', 5_000);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message);
    }
  }

  return (
    <div className="bg-white py-8 px-4 sm:border sm:rounded-lg sm:px-10 shadow-sm">
      {success 
        ? (
          <div className="text-grey-700 text-lg text-center mb-2">
            <div>
              <CheckCircleIcon className='h-12 w-12 text-green-600 m-auto' />
              <span className='block text-md'>Invition accepted.</span>
              <span className='block text-md'>Sending you to your Swishjam dashboard.</span>
            </div>
          </div>
        )
        : loggedInUser 
          ? (
            <>
              <h2 className="text-lg text-gray-900 text-center">
                <span className='font-medium'>{userInvite.invited_by_user.email}</span> has invited you to join the <span className='font-medium'>{userInvite.organization.name}</span> team on Swishjam.
              </h2>
              {loggedInUser.email !== email && (
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
                <span className='font-medium'>{userInvite.invited_by_user.email}</span> has invited you to join the <span className='font-medium'>{userInvite.organization.name}</span> team on Swishjam.
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