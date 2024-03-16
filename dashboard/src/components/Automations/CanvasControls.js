import useAutomationBuilder from "@/hooks/useAutomationBuilder"
import { FullscreenIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react"

export default function CanvasControls({ currentZoomLevel }) {
  const { zoomIn, zoomOut, fitView, intelligentlyFitView } = useAutomationBuilder();
  const canZoomIn = currentZoomLevel !== "100%"
  const canZoomOut = currentZoomLevel !== "50%"

  return (
    <div className='absolute bottom-2 left-7 z-10 bg-white border border-zinc-200 rounded-md p-1'>
      <button
        className={`flex items-center justify-center h-6 w-6 rounded-md transition-colors text-gray-700 p-1 ${canZoomIn ? 'hover:bg-gray-100' : 'cursor-not-allowed'}`}
        onClick={zoomIn}
        disabled={!canZoomIn}
      >
        <ZoomInIcon className='h-5 w-5' />
      </button>
      <div
        className='flex items-center justify-center h-6 w-6 rounded-md hover:bg-gray-100 transition-colors text-gray-700 text-xxs p-1 cursor-default'
      >
        {currentZoomLevel}
      </div>
      <button
        className={`flex items-center justify-center h-6 w-6 rounded-md transition-colors text-gray-700 p-1 ${canZoomOut ? 'hover:bg-gray-100' : 'cursor-not-allowed'}`}
        onClick={zoomOut}
        disabled={!canZoomOut}
      >
        <ZoomOutIcon className='h-5 w-5' />
      </button>
      <button
        className='flex items-center justify-center h-6 w-6 rounded-md transition-colors text-gray-700 p-1 hover:bg-gray-100'
        onClick={intelligentlyFitView}
      >
        <FullscreenIcon className='h-5 w-5' />
      </button>
    </div>
  )
}