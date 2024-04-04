import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/utils/Modal";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function NameAndDescriptionModal({ defaultName = '', defaultDescription = '', isOpen, onClose, onSave, saveText = 'Create Cohort' }) {
  const [cohortName, setCohortName] = useState(defaultName)
  const [cohortDescription, setCohortDescription] = useState(defaultDescription)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Name your cohort'>
      <form onSubmit={e => {
        e.preventDefault()
        onSave({ name: cohortName, description: cohortDescription })
      }}
      >
        <div>
          <label htmlFor='name' className='mb-1 block text-sm font-medium text-gray-700'>Name</label>
          <Input type='text' placeholder='My cohort' label='Name' value={cohortName} onChange={e => setCohortName(e.target.value)} />
        </div>
        <div className='mt-2'>
          <label htmlFor='name' className='mb-1 block text-sm font-medium text-gray-700'>Description</label>
          <Textarea
            type='textarea'
            placeholder='A short description of the cohort.'
            label='Description'
            value={cohortDescription}
            onChange={e => setCohortDescription(e.target.value)}
          />
        </div>
        <div className='mt-4 flex items-center justify-end space-x-4'>
          <Button variant='swishjam' type='submit'>
            {saveText}
          </Button>
        </div>
      </form>
    </Modal>
  )
}