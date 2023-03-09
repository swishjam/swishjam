import { CodeBracketIcon, CodeBracketSquareIcon, PaintBrushIcon, CameraIcon, ArrowsRightLeftIcon } from "@heroicons/react/20/solid"

const RESOURCE_TYPE_ICON_DICT = {
  'script': <CodeBracketIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'link': <PaintBrushIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'css': <PaintBrushIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'img': <CameraIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'fetch': <ArrowsRightLeftIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'xmlhttprequest': <ArrowsRightLeftIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'beacon': <ArrowsRightLeftIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'iframe': <CodeBracketSquareIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
  'other': <ArrowsRightLeftIcon className="h-4 w-4 text-gray-700 inline-block" aria-hidden="true" />,
}

export default function WaterfallRowName({ resource, index }) {
  return (
    <div className='flex items-center p-2'>
      <span className='mr-1'>{index + 1} </span>
      <span className='inline-block mr-1'>{RESOURCE_TYPE_ICON_DICT[resource.initiator_type] || resource.initiator_type}</span>
      <span>{resource.name}</span>
    </div>
  )
}