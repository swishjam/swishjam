import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useState } from "react"

// TODO: determine if we want to allow for the empty-space to actually be the rest of the page content
export default function ResizableDrawer({ children, openText = 'Open', height: collapsedHeight = '30px', ...props }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='w-full right-0 left-0 z-30' style={isOpen ? { position: 'absolute', top: 0, bottom: 0 } : { height: collapsedHeight }}>
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel
          className={`h-full ${isOpen ? 'bg-black opacity-20 cursor-pointer' : ''}`}
          id="empty-space"
          onClick={() => setIsOpen(false)}
        />

        <ResizableHandle withHandle={isOpen} disabled={!isOpen} />

        <ResizablePanel
          minSize={isOpen ? 10 : 100}
          maxSize={isOpen ? 80 : 100}
          {...props}
          id='content'
          className={`bg-white relative ${props.className || ''}`}
        >
          <button
            className='text-gray-700 text-xxs hover:bg-gray-100 rounded-md px-2 py-1 absolute top-1 right-1'
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? 'Close' : openText}
          </button>
          {isOpen && children}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}