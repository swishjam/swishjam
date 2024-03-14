'use client';

// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import UnsavedChangesContext from '@/contexts/UnsavedChangesContext';
import { useState } from 'react';

const UnsavedChangesProvider = ({ children }) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const guardFromUnsavedChanges = (initialState, currentState) => {
    setHasUnsavedChanges(JSON.stringify(initialState) !== JSON.stringify(currentState));
  };

  // const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  // const [confirmationDialogCallback, setConfirmationDialogCallback] = useState();

  // const closeConfirmationDialog = () => {
  //   setConfirmationDialogOpen(false);
  //   setConfirmationDialogCallback();
  // }

  return (
    <UnsavedChangesContext.Provider value={{ hasUnsavedChanges, guardFromUnsavedChanges }}>
      {/* <Dialog open={confirmationDialogOpen} onOpenChange={closeConfirmationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Unsaved Changes
            </DialogTitle>
          </DialogHeader>
          <div className='mt-4'>
            <p>Are you sure you want to leave? Changes you made will not be saved.</p>
          </div>
          <div className='mt-4 flex justify-end items-center space-x-2'>
            <Button variant='outline' onClick={closeConfirmationDialog}>Cancel</Button>
            <Button
              variant='swishjam'
              onClick={() => {
                setConfirmationDialogOpen(false);
                confirmationDialogCallback();
              }}
            >
              Leave Page
            </Button>
          </div>
        </DialogContent>
      </Dialog> */}
      {children}
    </UnsavedChangesContext.Provider>
  );
}

export { UnsavedChangesProvider };
export default UnsavedChangesProvider;