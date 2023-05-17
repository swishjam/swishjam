'use client';

import { useState, useEffect } from 'react';
import AuthenticatedView from "@/components/AuthenticatedView";
import { useAuth } from "@/components/AuthProvider";
import { API } from "@/lib/api-client/base";
import Modal from '@/components/utils/Modal';
import { formattedDate } from '@/lib/utils';
import { UserPlusIcon, EnvelopeIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import CopyToClipboard from 'react-copy-to-clipboard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Team() {
  const { userOrg } = useAuth();
  const [users, setUsers] = useState();
  const [inviteModalIsOpen, setInviteModalIsOpen] = useState(false);

  useEffect(() => {
    API.get('/api/organization/users').then(({ users, error }) => {
      setUsers(users);
    })
  }, [])

  return (
    <AuthenticatedView>
      <InviteModal 
        isOpen={inviteModalIsOpen} 
        onClose={() => setInviteModalIsOpen(false)} 
        onInviteSent={userInvite => setUsers([...users, { ...userInvite, email: userInvite.invited_email, status: 'pending' }])} 
      />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='grid gric-cols-2'>
          <h1 className="text-lg font-medium text-gray-700 mb-0">{userOrg?.name} Team Management</h1>
          <div className='flex justify-end'>
            <button
              onClick={() => setInviteModalIsOpen(true)}
              className="flex items-center rounded-md bg-swishjam px-2.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-swishjam-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-swishjam transition duration-300"
            >
              <UserPlusIcon className='h-4 w-4 inline-block mr-1' />
              Invite teammate
            </button>
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-300 mt-8">
          <thead>
            <tr>
              <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                Email
              </th>
              <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                Member Since
              </th>
              <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users 
              ? (
                users.map(({ id, email, created_at, invite_token, status = 'accepted' }) => (
                  <tr key={id} className='hover:bg-gray-50'>
                    <td className="cursor-default whitespace-nowrap py-3.5 px-3 text-sm text-gray-700 max-w-xs truncate overflow-hidden">
                      {email}
                    </td>
                    <td className="cursor-default whitespace-nowrap py-3.5 px-3 text-sm text-gray-700 max-w-xs truncate overflow-hidden">
                      {status === 'accepted' && formattedDate(created_at)}
                    </td>
                    <td className="cursor-default whitespace-nowrap py-3.5 px-3 text-sm text-gray-700 max-w-xs truncate overflow-hidden">
                      <div className={`inline-flex items-center rounded-md  px-2 py-1 text-xs font-medium ring-1 ring-inset ${status === 'accepted' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-orange-50 text-orange-700 ring-orange-600/20'}`}>
                        {status}
                      </div>
                    </td>
                    <td className="cursor-default whitespace-nowrap py-3.5 px-3 text-gray-700 text-sm max-w-xs truncate overflow-hidden">
                      <div className="py-1 flex items-center justify-end">
                        {status === 'pending' && (
                          <>
                            <ClipboardDocumentIcon className='h-4 w-4 inline-block mr-1' />
                            <CopyToClipboard 
                              text={`${window.location.origin}/invitation/${invite_token}`} 
                              className="inline-flex text-sm items-center cursor-pointer hover:text-swishjam hover:bg-gray-50"
                            >
                              <div onClick={e => {
                                const ogText = e.target.innerText;
                                e.target.innerText = 'Copied!';
                                setTimeout(() => e.target.innerText = ogText, 5_000);
                              }}>
                                Copy invite link
                              </div>
                            </CopyToClipboard>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    <td className="cursor-default whitespace-nowrap py-3.5 px-3 text-sm font-medium text-gray-900 max-w-xs truncate overflow-hidden">
                      <div className='h-8 w-32 bg-gray-200 rounded animate-pulse' />
                    </td>
                    <td className="cursor-default whitespace-nowrap py-3.5 px-3 text-sm font-medium text-gray-900 max-w-xs truncate overflow-hidden">
                      <div className='h-8 w-24 bg-gray-200 rounded animate-pulse' />
                    </td>
                    <td className="cursor-default whitespace-nowrap py-3.5 px-3 text-sm font-medium text-gray-900 max-w-xs truncate overflow-hidden">
                      <div className='h-8 w-18 bg-gray-200 rounded animate-pulse' />
                    </td>
                    <td className="cursor-default whitespace-nowrap py-3.5 px-3 text-sm font-medium text-gray-900 max-w-xs truncate overflow-hidden">
                    </td>
                  </tr>
                ))
              )
            }
          </tbody>
        </table>
      </main>
    </AuthenticatedView>
  )
}

const InviteModal = ({ isOpen, onClose, onInviteSent }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState();
  const [successMessage, setSuccessMessage] = useState();

  const inviteUser = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError();
    setSuccessMessage();
    const { userInvite, error } = await API.post('/api/user-invites/create', { email });
    setIsSubmitting(false);
    if (userInvite) {
      setSuccessMessage(`Invitation sent to ${email}.`);
      setEmail('');
      onInviteSent && onInviteSent(userInvite);
    } else {
      setError(error);
      setSuccessMessage();
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      content={(
        <>
          <h2 className='text-md font-medium text-gray-900 mb-4'>Invite a teammate</h2>
          <form onSubmit={inviteUser}>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Email</label>
              <input className='input' placeholder='johnny@gmail.com' type='email' value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            {error && <div className='text-sm text-center text-red-500 mt-2'>{error}</div>}
            {successMessage && <div className='text-sm text-center text-green-700 mt-2'>{successMessage}</div>}
            <button
              type="submit"
              className={`w-full mt-4 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${isSubmitting ? 'bg-gray-400' : 'bg-swishjam hover:bg-swishjam-dark'}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 
                <div className="h-6"><LoadingSpinner size={6} color='white' /></div> 
                : (
                  <>
                    <EnvelopeIcon className='h-4 w-4 inline-block mr-1' />
                    Send Invite
                  </>
                )
              }
            </button>
          </form>
        </>
      )} />
  )
}