'use client';

import { useState, useEffect, Fragment } from 'react';
import AuthenticatedView from "@/components/AuthenticatedView";
import { useAuth } from "@/components/AuthProvider";
import { API } from "@/lib/api-client/base";
import Modal from '@/components/utils/Modal';
import { formattedDate } from '@/lib/utils';
import { Menu, Transition } from '@headlessui/react';
import { UserPlusIcon, EnvelopeIcon, ClipboardDocumentIcon, CheckCircleIcon, EllipsisVerticalIcon, TrashIcon } from '@heroicons/react/24/outline';
import CopyToClipboard from 'react-copy-to-clipboard';
import LoadingSpinner from '@/components/LoadingSpinner';

const classNames = (...classes) => classes.filter(Boolean).join(' ')

export default function Team() {
  const { user: currentUser, userOrg } = useAuth();
  const [users, setUsers] = useState();
  const [inviteModalIsOpen, setInviteModalIsOpen] = useState(false);
  const [userToDisplayInRemoveModal, setUserToDisplayInRemoveModal] = useState();

  useEffect(() => {
    setUsers();
    API.get('/api/users/all').then(({ users, error }) => {
      setUsers(users);
    })
  }, [userOrg?.id])

  return (
    <AuthenticatedView>
      <InviteModal 
        isOpen={inviteModalIsOpen} 
        onClose={() => setInviteModalIsOpen(false)} 
        onInviteSent={userInvite => setUsers([...users, { ...userInvite, email: userInvite.invited_email, status: 'pending' }])} 
      />
      <RemoveUserModal 
        isOpen={!!userToDisplayInRemoveModal}  
        userId={userToDisplayInRemoveModal?.id}
        userEmail={userToDisplayInRemoveModal?.email}
        onClose={() => setUserToDisplayInRemoveModal()}
        onRemoveUser={user => setUsers(users.filter(u => u.id !== user.id))} 
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
                    <td className="cursor-default whitespace-nowrap py-3.5 px-3 text-gray-700 text-sm max-w-xs">
                      <div className="py-1 flex items-center justify-end">
                        {id !== currentUser?.id && (
                          <UserDropdown status={status} inviteToken={invite_token} onRemoveUserClick={() => setUserToDisplayInRemoveModal({ id, email })} />
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

const UserDropdown = ({ status, inviteToken, onRemoveUserClick }) => {
  const [copyText, setCopyText] = useState()

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
          <span className="sr-only">Open options</span>
          <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                status === 'pending'
                  ? (
                    <div
                      onClick={e => e.preventDefault()}
                      className={classNames(
                        active ? 'bg-gray-100 text-swishjam' : 'text-gray-700',
                        'block px-4 py-2 text-sm cursor-pointer flex items-center',
                        copyText ? 'text-green-700' : ''
                      )}
                    >
                      <CopyToClipboard
                        text={`${window.location.origin}/invitation/${inviteToken}`}
                        onCopy={() => {
                          setCopyText('Copied!')
                          setTimeout(() => setCopyText(), 5_000);
                        }}
                      >
                        <span className='block w-full'>
                          <ClipboardDocumentIcon className='h-4 w-4 inline-block mr-2' />
                          {copyText ? <span className='text-green-700'>{copyText}</span> : <>Copy Invite Link</>}
                        </span>
                      </CopyToClipboard>
                    </div>
                  ) : (
                    <>
                      <div
                        onClick={e => {
                          e.preventDefault()
                          onRemoveUserClick()
                        }}
                        className='text-gray-700 block px-4 py-2 text-sm cursor-pointer hover:bg-red-100 hover:text-red-700'
                      >
                        <TrashIcon className='h-4 w-4 inline-block mr-2' /> Remove user
                      </div>
                    </>
                  )
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

const RemoveUserModal = ({ userId, userEmail, isOpen, onClose, onRemoveUser }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const removeUser = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await API.post('/api/organization-users/delete', { userId });
    if (error) {
      setIsSubmitting(false);
      setError(error);
    } else {
      await onRemoveUser({ id: userId, email: userEmail });
      setShowSuccessMessage(true);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setTimeout(() => {
          setIsSubmitting(false);
          setError();
          setShowSuccessMessage(false);
        }, 500);
      }} 
      content={(
        showSuccessMessage 
          ? (
            <div className='px-4 py-8 text-center'>
              <h3 className='text-lg'>{userEmail} no longer has access to your Swishjam team.</h3>
            </div>
          ) : (
            <div className='p-4 text-center'>
              <h3 className='text-lg mb-2'>Are you sure you'd like to remove {userEmail} from your team?</h3>
              {error && <p className='text-sm text-red-600 mb-2'>{error}</p>}
              <div className='grid grid-cols-2 gap-x-4'>
                <button
                  className='mt-4 flex items-center justify-center py-2 px-4 border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 bg-white hover:bg-gray-100 focus:ring-offset-2 focus:ring-gray-100'
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      setIsSubmitting(false);
                      setError();
                      setShowSuccessMessage(false);
                    }, 500);
                  }}
                >
                  Nevermind
                </button>
                <button
                  onClick={removeUser}
                  className={`mt-4 flex items-center justify-center py-2 px-4 border border-red-600 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-red-500 hover:bg-red-600 focus:ring-offset-2 focus:ring-gray-600 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          )
      )}
    />
  )
}

const InviteModal = ({ isOpen, onClose, onInviteSent }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState();
  const [successMessage, setSuccessMessage] = useState('Invitation was sent dog!');
  const [userInviteToken, setUserInviteToken] = useState('fopo');
  const [copySuccessMessage, setCopySuccessMessage] = useState();

  const inviteUser = async e => {
    e.preventDefault();
    setUserInviteToken();
    setIsSubmitting(true);
    setError();
    setSuccessMessage();
    const { userInvite, error } = await API.post('/api/user-invites/create', { email });
    setIsSubmitting(false);
    if (userInvite) {
      setUserInviteToken(userInvite.invite_token);
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
      onClose={() => {
        onClose();
        setTimeout(() => {
          setEmail('');
          setError();
          setUserInviteToken();
          setSuccessMessage();
        }, 500)
      }} 
      content={
        userInviteToken
          ? (
            <>
              <div className='text-center'>
                <CheckCircleIcon className='h-12 w-12 text-green-500 mx-auto mb-2' />
                <h2 className='text-md font-medium text-gray-900 mb-4'>{successMessage}</h2>
                <div className='grid grid-cols-2 justify-center gap-x-4'>
                  <CopyToClipboard
                    text={`${window.location.origin}/invitation/${userInviteToken}`}
                    onCopy={() => {
                      setCopySuccessMessage('Copied!')
                      setTimeout(() => setCopySuccessMessage(), 5_000);
                    }}
                  >
                    <button className={`mt-4 flex items-center justify-center py-2 px-4 border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 bg-white hover:bg-gray-100 focus:ring-offset-2 focus:ring-gray-100`}>
                      <ClipboardDocumentIcon className='h-4 w-4 inline-block mr-1' />
                      {copySuccessMessage || 'Copy invitation link'}
                    </button>
                  </CopyToClipboard>
                  <button
                    type="button"
                    className={`mt-4 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 bg-swishjam hover:bg-swishjam-dark focus:ring-offset-2 focus:ring-swishjam-dark`}
                    onClick={() => {
                      setUserInviteToken();
                      setSuccessMessage();
                    }}
                  >
                    Invite another teammate
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className='text-md font-medium text-gray-900 mb-4'>Invite a teammate</h2>
              <form onSubmit={inviteUser}>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>Email</label>
                  <input className='input' placeholder='johnny@gmail.com' type='email' value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                {error && <div className='text-sm text-center text-red-500 mt-2'>{error}</div>}
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
          )
      } />
  )
}