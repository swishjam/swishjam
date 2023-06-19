import LighthouseScore from "@/components/WebPageTest/LighthouseScore";
import { formattedDate, formattedMsOrSeconds } from '@/lib/utils';
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import LoadingSpinner from "../LoadingSpinner";
import { usePopperTooltip } from "react-popper-tooltip"

function LabTestResultRow({ labTest, metricToDisplay, goodNeedsImprovementPoorTiers }) {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: false, trigger: 'hover' });

  const { good: goodUpperBound, needsImprovement: needsImprovementUpperBound } = goodNeedsImprovementPoorTiers;
  const poorUpperBound = needsImprovementUpperBound + (needsImprovementUpperBound - goodUpperBound)
  const status = labTest[metricToDisplay] < goodUpperBound ? 'good' : labTest[metricToDisplay] < needsImprovementUpperBound ? 'needs improvement' : 'poor';
  const indicatorMarginLeft = Math.min(
    100,
    status === 'good' 
      ? labTest[metricToDisplay] / goodUpperBound * 100 
      : status === 'needs improvement' 
        ? ((labTest[metricToDisplay] - goodUpperBound) / (needsImprovementUpperBound - goodUpperBound)) * 100 
        : ((labTest[metricToDisplay] - needsImprovementUpperBound) / (poorUpperBound - needsImprovementUpperBound)) * 100
  )

  let displayContent;
  if (labTest.completed_at && parseInt(labTest[metricToDisplay]) > -1) {
    displayContent = (
      <>
        <span className={`text-md font-medium w-20 ${labTest[metricToDisplay] < goodNeedsImprovementPoorTiers.good ? 'text-green-600' : labTest[metricToDisplay] < goodNeedsImprovementPoorTiers.needsImprovement ? 'text-yellow-600' : 'text-red-600'}`}>
          {metricToDisplay === 'cumulative_layout_shift' ? parseFloat(labTest[metricToDisplay]).toFixed(4) : formattedMsOrSeconds(labTest[metricToDisplay])}
        </span>
        <div className='w-44 h-6 inline-block ml-2'>
          <div className='bg-green-500 hover:bg-green-600 inline-block w-[33.3%] h-full relative'>
            {status === 'good' && (
              <div
                className='h-[125%] text-xs text-right absolute w-0 bottom-0 left-0 border-r border-dashed border-slate-600'
                style={{ marginLeft: `${indicatorMarginLeft}%` }}
              />
            )}
          </div>
          <div className='bg-yellow-400 hover:bg-yellow-500 inline-block w-[33.3%] h-full relative'>
            {status === 'needs improvement' && (
              <div
                className='h-[125%] text-xs text-right absolute w-0 bottom-0 left-0 border-r border-dashed border-slate-600'
                style={{ marginLeft: `${indicatorMarginLeft}%` }}
              />
            )}
          </div>
          <div className='bg-red-500 hover:bg-red-600 inline-block w-[33.3%] h-full relative'>
            {status === 'poor' && (
              <div
                className='h-[125%] text-xs text-right absolute w-0 bottom-0 left-0 border-r border-dashed border-slate-600'
                style={{ marginLeft: `${indicatorMarginLeft}%` }}
              />
            )}
          </div>
        </div>
      </>
    )
  } else if (labTest.completed_at) {
    displayContent = (
      <>
        <div className='text-sm text-gray-700 px-4 py-1 cursor-default' ref={setTriggerRef}>
          --
        </div>
        {visible && (
          <div className='bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg px-4 py-2' ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
            <div className='flex items-center'>
              <div className='text-sm text-gray-700'>Lab test was unable to determine the <span className='italic'>{metricToDisplay.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span> metric for this run.</div>
            </div>
          </div>
        )}
      </>
    )
  } else {
    displayContent = <LoadingSpinner size={6} />
  }
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className='text-sm text-gray-900'>
          {labTest.full_url}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className='flex items-center'>
          {displayContent}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {labTest.lighthouse_performance_score && <LighthouseScore score={parseInt(labTest.lighthouse_performance_score * 100)} size='tiny' centerAligned={false} />}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formattedDate(labTest.created_at)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <Link 
          href={`/lab-tests/results/${labTest.uuid}/overview`} 
          className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          View Test <ArrowRightIcon className='h-3 w-3 inline-block ml-1' />
        </Link>
      </td>
    </tr>
  )
}

export default function LabTestResultsTable({ labTests, metricToDisplay, goodNeedsImprovementPoorTiers }) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{metricToDisplay.split('_').join(' ')}</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lighthouse Score</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'></th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200 max-h-96 overflow-y-scroll">
        {labTests === undefined 
          ? (
            Array.from({ length: 10 }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className='inline-block w-16 h-6 bg-gray-200 rounded' />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className='flex items-center'>
                    <div className='inline-block w-20 h-6 bg-gray-200 rounded' />
                    <div className='w-44 h-6 inline-block ml-2'>
                      <div className='animate-pulse bg-green-500 inline-block w-[33.3%] h-full relative' />
                      <div className='animate-pulse bg-yellow-400 inline-block w-[33.3%] h-full relative' />
                      <div className='animate-pulse bg-red-500 inline-block w-[33.3%] h-full relative' />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className='rounded-full animate-pulse bg-gray-200 h-16 w-16' />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className='inline-block w-10 h-6 bg-gray-200 rounded' />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className='inline-block w-10 h-6 bg-gray-200 rounded' />
                </td>
              </tr>
            ))
          ) : (
            labTests.map((labTest, i) => (
              <LabTestResultRow key={i} labTest={labTest} metricToDisplay={metricToDisplay} goodNeedsImprovementPoorTiers={goodNeedsImprovementPoorTiers} />
            ))
          )
        }
      </tbody>
    </table >
  )
}