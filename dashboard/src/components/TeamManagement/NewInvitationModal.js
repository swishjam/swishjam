import { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import LoadingSpinner from '@/components/LoadingSpinner'
import Modal from '@/components/utils/Modal';
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useAuthData } from '@/hooks/useAuthData';
import { swishjam } from '@swishjam/react';
import { 
  LuCopy, LuMailPlus,
  LuMailCheck, LuPlus,
  LuCheck
} from 'react-icons/lu';

export default function NewInvitationModal({ isOpen, onClose, onInviteSent }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState();
  const [successMessage, setSuccessMessage] = useState();
  const [userInviteToken, setUserInviteToken] = useState();
  const [copySuccessMessage, setCopySuccessMessage] = useState();

  const { currentWorkspaceId, currentWorkspaceName } = useAuthData();

  const inviteUser = async e => {
    e.preventDefault();
    setUserInviteToken();
    setIsSubmitting(true);
    setError();
    setSuccessMessage();
    const response = await SwishjamAPI.WorkspaceInvitations.create({ email });
    setIsSubmitting(false);
    if (response.error) {
      swishjam.event('invite_teammate_error', { error: response.error, workspace: currentWorkspaceName, workspace_id: currentWorkspaceId })
      setError(response.error);
      setSuccessMessage();
    } else {
      swishjam.event('teammate_invited', { invited_email: response.invited_email, workspace: currentWorkspaceName, workspace_id: currentWorkspaceId })
      setUserInviteToken(response.invite_token);
      setSuccessMessage(`Invitation sent to ${response.invited_email}.`);
      setEmail('');
      onInviteSent && onInviteSent(response);
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
    >
      {userInviteToken
        ? (
          <>
            <div className='text-center'>
              <LuMailCheck className='h-12 w-12 text-green-500 mx-auto mb-2' />
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
                    {copySuccessMessage ? <LuCheck className='h-4 w-4 inline-block mr-2' />:<LuCopy className='h-4 w-4 inline-block mr-2' />}
                    {copySuccessMessage || 'Copy Invite Link'}
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
                  
                  <LuPlus className='h-4 w-4 inline-block mr-2' />
                  Invite Another Teammate
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className='text-md font-medium text-gray-900 mb-4'>Invite a teammate</h2>
            <form onSubmit={inviteUser}>
              <div className='mt-2'>
                <label className='block text-sm font-medium text-gray-700'>Teammate's Email</label>
                <input className='input mt-1' placeholder='johnny@gmail.com' type='email' value={email} onChange={e => setEmail(e.target.value)} />
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
                      <LuMailPlus className='h-4 w-4 inline-block mr-2' />
                      Send Invite
                    </>
                  )
                }
              </button>
            </form>
          </>
        )}
    </Modal>
  )
}