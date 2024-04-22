import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import Modal from "@components/utils/Modal"
import { useState } from "react"
import LoadingSpinner from "@components/LoadingSpinner";
import { Button } from "@components/ui/button";
import SwishjamAPI from "@/lib/api-client/swishjam-api";

export default function NewWorkspaceModal({ isOpen, onClose, onCreate, redirectOnCreate = true }) {
  const [isLoading, setIsLoading] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');

  const onSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    const { workspace, error } = await SwishjamAPI.Workspaces.create({ name: workspaceName, url: companyUrl })
    if (error) {
      setError(error)
    } else {
      if (redirectOnCreate) {
        window.location.href = `/change-workspaces/${workspace.id}`
      } else {
        onCreate(workspace)
        onClose()
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Create New Workspace'>
      <form onSubmit={onSubmit}>
        <div>
          <Label htmlFor='name'>Name*</Label>
          <Input
            id='name'
            placeholder='my workspace'
            value={workspaceName}
            onChange={e => setWorkspaceName(e.target.value)}
            required
          />
        </div>
        <div className='mt-2'>
          <Label htmlFor='url'>Company URL</Label>
          <Input
            id='url'
            placeholder='www.google.com'
            value={companyUrl}
            onChange={e => setCompanyUrl(e.target.value)}
          />
        </div>
        <div className='flex justify-end mt-4'>
          <Button variant='swishjam' type='submit' disabled={isLoading}>
            {isLoading && <LoadingSpinner size={6} centered={true} color='white' />}
            {!isLoading && 'Create Workspace'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}