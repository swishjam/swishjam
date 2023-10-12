'use client';

import AcceptForm from '@/components/TeamManagement/UserInvites/AcceptForm';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { SwishjamAPI } from "@/lib/api-client/swishjam-api";
import Logo from '@/components/Logo';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Invitation({ params }) {
  const { inviteToken } = params;
  const router = useRouter()
  const [userInvite, setUserInvite] = useState();

  const isExpired = userInvite ? new Date() >= new Date(userInvite.expires_at) : false;

  useEffect(() => {
    SwishjamAPI.WorkspaceInvitations.retrieve(inviteToken).then(response => {
      if (response.error) {
        router.push('/login')
      } else {
        setUserInvite(response)
      }
    });
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
                ? <div className='text-center'>This invite is no longer valid, please request a new one from your organization admin.</div>
                : <AcceptForm userInvite={userInvite} />
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