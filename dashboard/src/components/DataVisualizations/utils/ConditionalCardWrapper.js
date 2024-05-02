import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoIcon, SlidersHorizontalIcon } from "lucide-react"
import SettingsDropdown from "./SettingsDropdown"
import useSheet from "@/hooks/useSheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltipable } from "@/components/ui/tooltip"

export default function ConditionalCardWrapper({
  AdditionalHeaderActions = [],
  children,
  dataVisualizationId,
  DocumentationContent,
  includeCard = true,
  includeSettingsDropdown = true,
  includeQueryDetails = true,
  isEnlargable = true,
  linkToDataVisualizationDetailsPage = true,
  loading = false,
  onlyDisplayHeaderActionsOnHover = true,
  QueryDetails,
  settings,
  subtitle,
  title,
  ...props
}) {
  const { openSheetWithContent } = useSheet();

  const HeaderContent = <>
    <CardHeader className="space-y-0 pb-2">
      <CardTitle className="text-sm font-medium cursor-default">
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-x-1'>
            {title}
            {DocumentationContent && (
              <button
                onClick={() => openSheetWithContent({ title, content: DocumentationContent })}
                className='cursor-pointer text-gray-500 hover:text-gray-700 transition-all rounded-full hover:bg-gray-100 p-1'
              >
                <InfoIcon className='h-3 w-3' />
              </button>
            )}
          </div>
          <div className={`flex justify-end flex-shrink gap-x-2 duration-300 transition ${onlyDisplayHeaderActionsOnHover ? 'opacity-0 group-hover:opacity-100' : ''}`}>
            {AdditionalHeaderActions}
            {(includeQueryDetails && QueryDetails) && (
              <Tooltipable content={QueryDetails}>
                <div className='flex items-center justify-center duration-300 transition text-gray-500 hover:bg-gray-100 rounded-md'>
                  <SlidersHorizontalIcon className='h-4 w-4 m-1 text-gray-500' />
                </div>
              </Tooltipable>
            )}
            {includeSettingsDropdown && (
              <SettingsDropdown dataVisualizationId={linkToDataVisualizationDetailsPage && dataVisualizationId} />
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
      >
        {HeaderContent}
        <CardContent className='flex-1 min-h-0 h-full mt-2 flex flex-col'>
          {loading ? <Skeleton className="w-full rounded-sm mt-1 h-full" /> : children}
        </CardContent>
      </Card>
    )
  } else {
    return (
      <>
        <div
          {...props}
          className={`h-full flex flex-col group relative transition-transform duration-500 ${props.className || ''}`}
        >
          {HeaderContent}
          <CardContent className='flex-1 min-h-0 h-full mt-2 flex flex-col'>
            {loading ? <Skeleton className="w-full rounded-sm mt-1 h-full" /> : children}
          </CardContent>
        </div>
      </>
    )
  }
}

// const { enlargeDataVisualization, updateEnlargableDataVisualization, dataVisualizationDetailsToEnlarge } = useEnlargableDataVisualization();
// const containerEl = useRef();
{/* {isEnlargable && (
  <button
    onClick={() => enlargeDataVisualization({ title, DocumentationContent, AdditionalHeaderActions, settings, children, el: containerEl.current })}
    className={`flex items-center justify-center outline-0 ring-0  text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md`}
  >
    <ArrowsPointingOutIcon className='outline-0 ring-0 h-4 w-4 m-1 text-gray-500 cursor-pointer' />
  </button>
)} */}
// removing enlargable visualizations for now, shouldn't be as necessary now that we have data visualization detail pages
// useEffect(() => {
//   const isTheEnlargedDataVisualization = dataVisualizationDetailsToEnlarge && dataVisualizationDetailsToEnlarge.el === containerEl.current;
//   if (isTheEnlargedDataVisualization) {
//     updateEnlargableDataVisualization({
//       title,
//       subtitle,
//       DocumentationContent,
//       AdditionalHeaderActions,
//       settings,
//       QueryDetails,
//       includeSettingsDropdown,
//       children,
//       el: containerEl.current,
//     })
//   }
// }, [children])