import { Button } from "@/components/ui/button";
import ConfirmationModalContext from "@/contexts/ConfirmationModalContext";
import Modal from "@/components/utils/Modal";
import { useState } from "react";

export const ConfirmationModalProvider = ({ children }) => {
  const [confirmationModalIsDisplayed, setConfirmationModalIsDisplayed] = useState(false)
  const [confirmationModalTitle, setConfirmationModalTitle] = useState()
  const [confirmationModalBody, setConfirmationModalBody] = useState()
  const [onConfirmation, setOnConfirmation] = useState()

  const displayConfirmation = ({ title, body, callback }) => {
    if (!title || !body || !callback) {
      throw new Error('displayConfirmation requires a title, body, and callback argument.')
    }
    setConfirmationModalTitle(title)
    setConfirmationModalBody(body)
    setOnConfirmation(() => () => {
      callback()
      close()
    })
    setConfirmationModalIsDisplayed(true)
  }

  const close = () => {
    setConfirmationModalIsDisplayed(false)
    setOnConfirmation(null)
    setTimeout(() => {
      setConfirmationModalTitle(null)
      setConfirmationModalBody(null)
    }, 500)
  }

  return (
    <ConfirmationModalContext.Provider value={{ displayConfirmation }}>
      <Modal isOpen={confirmationModalIsDisplayed} onClose={close} title={confirmationModalTitle}>
        <p className='mt-2 text-sm text-gray-500'>{confirmationModalBody}</p>
        <div className='flex justify-end items-center space-x-4 mt-8'>
          <Button variant='outline' onClick={close}>
            Cancel
          </Button>
          <Button onClick={onConfirmation} variant='destructive'>
            Confirm
          </Button>
        </div>
      </Modal>
      {children}
    </ConfirmationModalContext.Provider>
  )
}

export default ConfirmationModalProvider;