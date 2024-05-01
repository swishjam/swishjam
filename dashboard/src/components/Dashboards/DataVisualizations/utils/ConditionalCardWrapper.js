import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoIcon, SlidersHorizontalIcon } from "lucide-react"
import SettingsDropdown from "./SettingsDropdown"
import { useEnlargableDashboardComponent } from "@/hooks/useEnlargableDashboardComponent"
import useSheet from "@/hooks/useSheet"
import { useEffect, useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltipable } from "@/components/ui/tooltip"

export default function ConditionalCardWrapper({
  AdditionalHeaderActions = [],
  children,
  dataVisualizationId,
  DocumentationContent,
  includeCard = true,
  includeSettingsDropdown = true,
  isEnlargable = true,
  linkToComponentDetailsPage = true,
  loading = false,
  onSettingChange,
  QueryDetails,
  settings,
  subtitle,
  title,
  ...props
}) {
  const { openSheetWithContent } = useSheet();
  const { enlargeComponent, updateComponent, componentDetailsToEnlarge } = useEnlargableDashboardComponent();
  const containerEl = useRef();
  // const [loadingStateHeight, setLoadingStateHeight] = useState(0);

  // useEffect(() => {
  //   if (containerEl.current) {
  //     setLoadingStateHeight(containerEl.current.offsetWidth * 0.33)
  //   }
  // }, [containerEl.current])

  useEffect(() => {
    const enlargedComponentIsThisComponent = componentDetailsToEnlarge && componentDetailsToEnlarge.el === containerEl.current;
    if (enlargedComponentIsThisComponent) {
      updateComponent({ title, subtitle, DocumentationContent, AdditionalHeaderActions, settings, QueryDetails, includeSettingsDropdown, onSettingChange, children, el: containerEl.current })
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
          <div className='flex justify-end flex-shrink gap-x-2'>
            {QueryDetails && (
              <Tooltipable content={QueryDetails}>
                <div className='group-hover:opacity-100 opacity-0 flex items-center justify-center duration-300 transition text-gray-500 hover:bg-gray-100 rounded-md'>
                  <SlidersHorizontalIcon className='h-4 w-4 m-1 text-gray-500' />
                </div>
              </Tooltipable>
            )}
            {isEnlargable && (
              <button
                onClick={() => enlargeComponent({ title, DocumentationContent, AdditionalHeaderActions, settings, onSettingChange, children, el: containerEl.current })}
                className={`active:opacity-100 focus:opacity-100 group-hover:opacity-100 opacity-0 flex items-center justify-center outline-0 ring-0 duration-300 transition text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md`}
              >
                <ArrowsPointingOutIcon className='outline-0 ring-0 h-4 w-4 m-1 text-gray-500 cursor-pointer' />
              </button>
            )}
            {AdditionalHeaderActions}
            {((includeSettingsDropdown && settings) || (dataVisualizationId && linkToComponentDetailsPage)) && (
              <SettingsDropdown
                options={settings}
                dataVisualizationId={linkToComponentDetailsPage && dataVisualizationId}
              />
            )}
          </div>
        </div>
      </CardTitle>
      {subtitle && <h2 className='text-xs text-gray-500 w-fit'>{subtitle}</h2>}
    </CardHeader>
  </>

  if (includeCard) {
    return (
      <Card
        {...props}
        className={`h-full flex flex-col group relative transition-transform duration-500 ${props.className || ''}`}
        ref={containerEl}
      >
        {HeaderContent}
        <CardContent className='flex-1 min-h-0 h-full mt-2 flex flex-col'>
          {loading
            // ? <Skeleton className="w-full rounded-sm mt-1 h-full" style={{ height: `${loadingStateHeight}px` }} />
            ? <Skeleton className="w-full rounded-sm mt-1 h-full" />
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
          className={`h-full flex flex-col group relative transition-transform duration-500 ${props.className || ''}`}
          ref={containerEl}
        >
          {HeaderContent}
          <CardContent className='flex-1 min-h-0 h-full mt-2 flex flex-col'>
            {loading
              ? <Skeleton className="w-full rounded-sm mt-1 h-full" />
              : children
            }
          </CardContent>
        </div>
      </>
    )
  }

}