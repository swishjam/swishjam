import { FoldVerticalIcon, MapIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { MiniMap } from "reactflow"

export default function CustomMiniMap() {
  const [isOpen, setIsOpen] = useState(false)

  if (isOpen) {
    return (
      <div className='absolute bottom-2 right-2 rounded-md w-[230px] h-[180px]'>
        <div
          className='h-6 w-6 absolute top-0 right-0 z-10 flex items-center justify-center hover:bg-gray-100 rounded cursor-pointer'
          onClick={() => setIsOpen(false)}
        >
          <XIcon className='h-4 w-4' />
        </div>
        <MiniMap nodeColor='#cbd2fc' pannable />
      </div>
    )
  } else {
    return (
      <div
        className='absolute h-8 w-8 flex items-center justify-center cursor-pointer bottom-2 right-2 rounded-md border border-zinc-200 bg-white hover:bg-gray-100 transition-colors p-1 z-10'
        onClick={() => setIsOpen(true)}
      >
        <MapIcon className='h-4 w-4' />
      </div>
    )
  }
}