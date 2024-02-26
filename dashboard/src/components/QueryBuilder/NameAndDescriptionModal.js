import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/utils/Modal";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function NameAndDescriptionModal({ defaultName = '', defaultDescription = '', isOpen, onClose, onSave, saveText = 'Create Cohort' }) {
  const [segmentName, setSegmentName] = useState(defaultName)
  const [segmentDescription, setSegmentDescription] = useState(defaultDescription)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Name your cohort'>
      <form onSubmit={e => {
        e.preventDefault()
        onSave({ name: segmentName, description: segmentDescription })
      }}
      >
        <div>
          <label htmlFor='name' className='mb-1 block text-sm font-medium text-gray-700'>Name</label>
          <Input type='text' placeholder='My cohort' label='Name' value={segmentName} onChange={e => setSegmentName(e.target.value)} />
        </div>
        <div className='mt-2'>
          <label htmlFor='name' className='mb-1 block text-sm font-medium text-gray-700'>Description</label>
          <Textarea type='textarea' placeholder='A short description of the cohort.' label='Description' value={segmentDescription} onChange={e => setSegmentDescription(e.target.value)} />
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