'use client';

import { useState } from 'react';
import SheetContext from '@/contexts/SheetContext';
import {
  Sheet,
  SheetClose,
  SheetContent,
  // SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  // SheetTrigger,
} from "@/components/ui/sheet"

const SheetProvider = ({ children }) => {
  const [sheetContent, setSheetContent] = useState(null);
  const [sheetIsOpen, setSheetIsOpen] = useState(false);
  const [sheetTitle, setSheetTitle] = useState('');

  const openSheetWithContent = ({ title, content }) => {
    setSheetTitle(title)
    setSheetContent(content);
    setSheetIsOpen(true);
  }

  const onOpenChange = isOpen => {
    if (!isOpen) {
      setSheetContent(null);
      setSheetTitle('');
      setSheetIsOpen(false);
    }
  }

  return (
    <SheetContext.Provider value={{ openSheetWithContent }}>
      <Sheet open={sheetIsOpen} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader className='border-b mb-2 pb-2'>
            <SheetTitle>{sheetTitle}</SheetTitle>
          </SheetHeader>
          <div className='text-sm text-gray-500'>
            {sheetContent}
          </div>
          <SheetFooter>
            <SheetClose />
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {children}
    </SheetContext.Provider>
  );
}

export { SheetProvider };
export default SheetProvider;