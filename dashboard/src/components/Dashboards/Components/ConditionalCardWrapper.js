import { ArrowsPointingInIcon, ArrowsPointingOutIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { InfoIcon } from "lucide-react"
import useSheet from "@/hooks/useSheet"
import { useState } from "react"

const SettingsDropdown = ({ options, onSettingChange = () => { } }) => {
  const [open, setOpen] = useState()

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="outline-0 ring-0">
        <EllipsisVerticalIcon className={`${open ? '!opacity-100' : ''} outline-0 ring-0 active:opacity-100 focus:opacity-100 group-hover:opacity-100 opacity-0 duration-300 transition h-5 w-5 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={'end'}>
        {options.map((option, index) => (
          <DropdownMenuItem
            key={index}
            className={`cursor-pointer ${option.enabled ? 'text-swishjam font-medium hover:text-swishjam' : ''}`}
            onClick={() => {
              const valueChangedFrom = option.enabled;
              const valueChangedTo = !option.enabled;
              option.enabled = valueChangedTo;
              onSettingChange({ attribute: option.attribute, valueChangedFrom, valueChangedTo })
            }}
          >
            {option.enabled && <CheckCircleIcon className='h-4 w-4 absolute' />}
            <span className='mx-6'>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function ConditionalCardWrapper({
  AdditionalHeaderActions = [],
  children,
  DocumentationContent,
  includeCard = true,
  includeSettingsDropdown = true,
  isExpandable = true,
  onSettingChange,
  settings,
  title,
  ...props
}) {
  const [isEnlarged, setIsEnlarged] = useState(false)
  const { openSheetWithContent } = useSheet();

  const HeaderContent = <>
    <CardHeader className="space-y-0 pb-2">
      <CardTitle className="text-sm font-medium cursor-default">
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-x-1'>
            {title}
            {DocumentationContent && (
              <a
                onClick={() => openSheetWithContent({ title, content: DocumentationContent })}
                className='cursor-pointer text-gray-500 hover:text-gray-700 transition-all rounded-full hover:bg-gray-100 p-1'
              >
                <InfoIcon className='h-3 w-3' />
              </a>
            )}
          </div>
          <div className='flex justify-end flex-shrink gap-x-1'>
            {isExpandable && (
              <button onClick={() => setIsEnlarged(!isEnlarged)} className='rounded hover:bg-gray-100 p-1'>
                {isEnlarged
                  ? <ArrowsPointingInIcon className='outline-0 ring-0 h-4 w-4 text-gray-500 cursor-pointer' />
                  : <ArrowsPointingOutIcon className='outline-0 ring-0 active:opacity-100 focus:opacity-100 group-hover:opacity-100 opacity-0 duration-300 transition h-4 w-4 text-gray-500 cursor-pointer' />}
              </button>
            )}
            {AdditionalHeaderActions}
            {settings && onSettingChange && <SettingsDropdown options={settings} onSettingChange={onSettingChange} />}
          </div>
        </div>
      </CardTitle>
    </CardHeader>
  </>

  if (includeCard) {
    return (
      <>
        {isEnlarged && (
          <div
            onClick={() => setIsEnlarged(false)}
            className='fixed top-0 left-0 right-0 bottom-0 z-[48] bg-black bg-opacity-50 cursor-pointer'
          />
        )}
        <Card {...props} className={`group ${props.className || ''} ${isEnlarged ? 'fixed w-[90vw] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[49] bg-white shadow-lg' : ''}`}>
          {HeaderContent}
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </>
    )
  } else {
    return (
      <>
        {isEnlarged && (
          <div
            onClick={() => setIsEnlarged(false)}
            className='fixed top-0 left-0 right-0 bottom-0 z-[48] bg-black bg-opacity-50 cursor-pointer'
          />
        )}
        <div {...props} className={`group ${props.className || ''} ${isEnlarged ? 'fixed w-[90vw] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[49] bg-white shadow-lg' : ''}`}>
          {HeaderContent}
          <CardContent>
            {children}
          </CardContent>
        </div>
      </>
    )
  }
}