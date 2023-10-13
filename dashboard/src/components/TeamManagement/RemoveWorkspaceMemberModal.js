import Modal from '@/components/utils/Modal'
import SwishjamAPI from '@/lib/api-client/swishjam-api';
import { useState } from 'react'

export default function RemoveUserModal({ workspaceMemberId, userEmail, onClose, onRemoveWorkspaceMember }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const removeUser = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await SwishjamAPI.WorkspaceMembers.delete(workspaceMemberId);
    if (error) {
      setIsSubmitting(false);
      setError(error);
    } else {
      onRemoveWorkspaceMember && onRemoveWorkspaceMember(workspaceMemberId);
      setShowSuccessMessage(true);
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={() => {
        onClose();
        setTimeout(() => {
          setIsSubmitting(false);
          setError();
          setShowSuccessMessage(false);
        }, 500);
      }}
    >
      {showSuccessMessage
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
      }
    </Modal>
  )
}