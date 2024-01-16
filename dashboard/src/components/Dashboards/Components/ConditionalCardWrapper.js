import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoIcon } from "lucide-react"
import SettingsDropdown from "./SettingsDropdown"
import { useEnlargableDashboardComponent } from "@/hooks/useEnlargableDashboardComponent"
import useSheet from "@/hooks/useSheet"
import { useRef } from "react"

export default function ConditionalCardWrapper({
  AdditionalHeaderActions = [],
  children,
  DocumentationContent,
  includeCard = true,
  includeSettingsDropdown = true,
  isEnlargable = true,
  onSettingChange,
  settings,
  title,
  ...props
}) {
  const { openSheetWithContent } = useSheet();
  const { enlargeComponent } = useEnlargableDashboardComponent();

  const containerEl = useRef();

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
            {isEnlargable && (
              <button
                onClick={() => enlargeComponent({ title, DocumentationContent, AdditionalHeaderActions, settings, onSettingChange, children, el: containerEl.current })}
                className={`active:opacity-100 focus:opacity-100 group-hover:opacity-100 opacity-0 flex items-center justify-center outline-0 ring-0 duration-300 transition text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md`}
              >
                <ArrowsPointingOutIcon className='outline-0 ring-0 h-4 w-4 m-1 text-gray-500 cursor-pointer' />
              </button>
            )}
            {AdditionalHeaderActions}
            {settings && <SettingsDropdown options={settings} />}
          </div>
        </div>
      </CardTitle>
    </CardHeader>
  </>


  if (includeCard) {
    return (
      <Card
        {...props}
        className={`group relative transition-transform duration-500 ${props.className || ''}`}
        ref={containerEl}
      >
        {HeaderContent}
        <CardContent>
          {children}
        </CardContent>
      </Card>
    )
  } else {
    return (
      <>
        <div
          {...props}
          className={`group relative transition-transform duration-500 ${props.className || ''}`}
          ref={containerEl}
        >
          {HeaderContent}
          <CardContent>
            {children}
          </CardContent>
        </div>
      </>
    )
  }

}