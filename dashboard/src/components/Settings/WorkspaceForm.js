import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuthData, setAuthToken } from '@/components/Auth/AuthProvider';
import { API } from '@/lib/api-client/base';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function WorkspaceForm({ onUpdate = () => {}, isSubmittable = true }) {
  const { authData } = useAuthData();
  const [workspaceName, setWorkspaceName] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessIndicator, setShowSuccessIndicator] = useState(false);

  useEffect(() => {
    setWorkspaceName(authData?.currentWorkspaceName());
  }, [authData?.currentWorkspaceName()])

  const handleSubmit = (e) => {
    if (!isSubmittable) return;
    e.preventDefault();
    setIsLoading(true);
    if (!workspaceName || workspaceName.length === 0) {
      setErrorMessage('Workspace name cannot be blank.');
      setIsLoading(false);
    } else {
      API.patch('/api/v1/workspace/update', { workspace: { name: workspaceName } }).then(({ workspace, auth_token, error }) => {
        setIsLoading(false);
        if (error) {
          setErrorMessage(result.error);
        } else {
          setAuthToken(auth_token);
          onUpdate(workspace);
          setShowSuccessIndicator(true);
          setTimeout(() => {
            setShowSuccessIndicator(false);
          }, 5_000);
        }
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
        Workspace name
      </label>
      <div className="mt-2 flex">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
          <input
            type="text"
            value={workspaceName}
            onChange={e => setWorkspaceName(e.target.value)}
            className="input"
          />
        </div>
        {!isSubmittable
          ? <button className='ml-2 w-24 h-10 rounded-md bg-gray-200 animate-pulse' disabled />
          : (
            <button
              type="submit"
              className={`ml-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${isLoading ? 'bg-gray-400' : 'bg-swishjam hover:bg-swishjam-dark'}`}
              disabled={isLoading}
            >
              {showSuccessIndicator
                ? <>
                  Updated <CheckCircleIcon className='w-5 h-5 ml-1' />
                </>
                : isLoading 
                  ? <LoadingSpinner color='white' className='w-5 h-5' /> 
                  : 'Update'}
            </button>
          )
        }
      </div>
      {errorMessage && <div className="text-red-600 text-sm mt-2">{errorMessage}</div>}
    </form>
  )
}