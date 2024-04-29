import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoIcon } from "lucide-react"
import SettingsDropdown from "./SettingsDropdown"
import { useEnlargableDashboardComponent } from "@/hooks/useEnlargableDashboardComponent"
import useSheet from "@/hooks/useSheet"
import { useEffect, useRef, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function ConditionalCardWrapper({
  AdditionalHeaderActions = [],
  children,
  DocumentationContent,
  includeCard = true,
  includeSettingsDropdown = true,
  isEnlargable = true,
  loading = false,
  onSettingChange,
  settings,
  subtitle,
  title,
  ...props
}) {
  const { openSheetWithContent } = useSheet();
  const { enlargeComponent, updateComponent, componentDetailsToEnlarge } = useEnlargableDashboardComponent();
  const containerEl = useRef();
  const [loadingStateHeight, setLoadingStateHeight] = useState(0);

  useEffect(() => {
    if (containerEl.current) {
      setLoadingStateHeight(containerEl.current.offsetWidth * 0.33)
    }
  }, [containerEl.current])

  useEffect(() => {
    const enlargedComponentIsThisComponent = componentDetailsToEnlarge && componentDetailsToEnlarge.el === containerEl.current;
    if (enlargedComponentIsThisComponent) {
      updateComponent({ title, subtitle, DocumentationContent, AdditionalHeaderActions, settings, includeSettingsDropdown, onSettingChange, children, el: containerEl.current })
    }
  }, [children])

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
            {includeSettingsDropdown && settings && <SettingsDropdown options={settings} />}
          </div>
        </div>
      </CardTitle>
      {subtitle && <h2 className='text-xs text-gray-500'>{subtitle}</h2>}
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
          {loading
            ? <Skeleton className="w-full rounded-sm mt-1" style={{ height: `${loadingStateHeight}px` }} />
            : children
          }
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
            {loading
              ? <Skeleton className="w-full rounded-sm mt-1" style={{ height: `${loadingStateHeight}px` }} />
              : children
            }
          </CardContent>
        </div>
      </>
    )
  }

}