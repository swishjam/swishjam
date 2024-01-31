'use client';

import { usePathname } from 'next/navigation'
import CopyToClipboard from 'react-copy-to-clipboard';
import InviteModal from '@/components/TeamManagement/NewInvitationModal';
import RemoveWorkspaceMemberModal from '@/components/TeamManagement/RemoveWorkspaceMemberModal';
import { Menu, Transition } from '@headlessui/react';
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import { useAuthData } from '@/hooks/useAuthData'
import { useState, useEffect, Fragment } from 'react';
import Tabs from '@/components/Settings/Tabs';

import { LuTrash, LuMoreVertical, LuPlus, LuClipboardCheck  } from 'react-icons/lu'

const classNames = (...classes) => classes.filter(Boolean).join(' ')

export default function Team() {
  const pathname = usePathname();
  const { userId: currentUserId } = useAuthData()
  const [inviteModalIsOpen, setInviteModalIsOpen] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState();
  const [workspaceMemberToDisplayInRemoveModal, setWorkspaceMemberToDisplayInRemoveModal] = useState();

  useEffect(() => {
    setWorkspaceMembers();
    SwishjamAPI.Team.workspaceMembers().then(setWorkspaceMembers)
  }, [])

  return (
    <>
      <InviteModal
        isOpen={inviteModalIsOpen}
        onClose={() => setInviteModalIsOpen(false)}
      // we're not currently displaying pending invites here
      // onInviteSent={userInvite => setWorkspaceMembers([...workspaceMembers, { ...userInvite, email: userInvite.invited_email, status: 'pending' }])}
      />
      {workspaceMemberToDisplayInRemoveModal && (
        <RemoveWorkspaceMemberModal
          workspaceMemberId={workspaceMemberToDisplayInRemoveModal.id}
          userEmail={workspaceMemberToDisplayInRemoveModal.user.email}
          onClose={() => setWorkspaceMemberToDisplayInRemoveModal()}
          onRemoveWorkspaceMember={workspaceMemberId => setWorkspaceMembers(workspaceMembers.filter(wm => wm.id !== workspaceMemberId))}
        />
      )}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 mt-12">
        <div className='grid grid-cols-2 my-8 flex items-center'>
          <div>
            <h1 className="text-lg font-medium text-gray-700 mb-0">Settings</h1>
          </div>
        </div>

        <Tabs className="mb-8" currentPath={pathname} />
    
        <div className='my-8 grid grid-cols-2'>
          <h1 className="text-lg font-medium text-gray-700 mb-0">Team Management</h1>
          <div className='flex justify-end'>
            <button
              onClick={() => setInviteModalIsOpen(true)}
              className="flex items-center rounded-md bg-swishjam px-2.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-swishjam-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-swishjam transition duration-300"
            >
              <LuPlus className='h-4 w-4 inline-block mr-1' />
              New Teammate
            </button>
          </div>
        </div>

        <div className='mt-8 border border-zinc-200 shadow-sm rounded-md overflow-hidden'>
        <table className="min-w-full divide-y divide-gray-300">
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
            {workspaceMembers
              ? (
                workspaceMembers.map(({ id, user, created_at, invite_token, status = 'accepted' }) => (
                  <tr key={id} className='hover:bg-gray-50'>
                    <td className="cursor-default whitespace-nowrap py-3.5 px-3 text-sm text-gray-700 max-w-xs truncate overflow-hidden">
                      {user.email}
                    </td>
                    <td className="cursor-default whitespace-nowrap py-3.5 px-3 text-sm text-gray-700 max-w-xs truncate overflow-hidden">
                      {status === 'accepted' && new Date(created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="cursor-default whitespace-nowrap py-3.5 px-3 text-sm text-gray-700 max-w-xs truncate overflow-hidden">
                      <div className={`inline-flex items-center rounded-md  px-2 py-1 text-xs font-medium ring-1 ring-inset ${status === 'accepted' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-orange-50 text-orange-700 ring-orange-600/20'}`}>
                        {status}
                      </div>
                    </td>
                    <td className="cursor-default whitespace-nowrap py-3.5 px-3 text-gray-700 text-sm max-w-xs">
                      <div className="py-1 flex items-center justify-end">
                        {user.id !== currentUserId && (
                          <UserDropdown status={status} inviteToken={invite_token} onRemoveUserClick={() => setWorkspaceMemberToDisplayInRemoveModal({ id, user })} />
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
        </div>
      </main>
    </>
  )
}

const UserDropdown = ({ status, inviteToken, onRemoveUserClick }) => {
  const [copyText, setCopyText] = useState()

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
          <span className="sr-only">Open options</span>
          <LuMoreVertical className="h-5 w-5" aria-hidden="true" />
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
                          <LuClipboardCheck className='h-4 w-4 inline-block mr-2' />
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
                        <LuTrash className='h-4 w-4 inline-block mr-2' /> Remove user
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

