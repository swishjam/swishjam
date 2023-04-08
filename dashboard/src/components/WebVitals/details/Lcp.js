import { LargestContentfulPaintEntriesApi } from "@/lib/api-client/largest-contentful-paint-entries"
import { formattedMsOrSeconds } from "@/lib/utils";
import { useEffect, useState } from "react"
import { usePopperTooltip } from "react-popper-tooltip"

export default function LcpDetail({ accronym, deviceTypes, urlHost, urlPath }) {
  const [lcpEntries, setLcpEntries] = useState();

  useEffect(() => {
    const params = { accronym, urlHost, urlPath, deviceTypes: JSON.stringify(deviceTypes) };
    if (urlPath === 'All Paths') delete params.urlPath;
    LargestContentfulPaintEntriesApi.getEntries(params).then(setLcpEntries);
  }, [urlHost, urlPath]);

  const totalEntries = lcpEntries ? lcpEntries.reduce((acc, entry) => parseInt(acc) + parseInt(entry.count), 0) : null;
  const dedupedEntries = lcpEntries ? lcpEntries.reduce((acc, entry) => {
    try {
      const strippedUrl = `${new URL(entry.url).hostname}${new URL(entry.url).pathname}`;
      const existingEntry = acc.find(e => strippedUrl === e.strippedUrl);
      if (existingEntry) {
        existingEntry.size = (existingEntry.size + entry.size) / 2;
        existingEntry.render_time = (existingEntry.render_time + entry.render_time) / 2;
        existingEntry.load_time = (existingEntry.load_time + entry.load_time) / 2;
        existingEntry.start_time = (existingEntry.start_time + entry.start_time) / 2;
        existingEntry.duration = (existingEntry.duration + (entry.render_time - entry.load_time)) / 2;
        existingEntry.count += parseInt(entry.count);
        existingEntry.percentageLcp = (parseInt(existingEntry.count) / parseInt(totalEntries)) * 100;
      } else {
        const strippedUrl = `${new URL(entry.url).hostname}${new URL(entry.url).pathname}`;
        acc.push({ 
          ...entry, 
          count: parseInt(entry.count),
          strippedUrl: strippedUrl, 
          duration: entry.render_time - entry.load_time, 
          percentageLcp: (parseInt(entry.count) / parseInt(totalEntries)) * 100 
        });
      }
    } catch (err) {
      acc.push({ ...entry, duration: entry.render_time - entry.load_time, percentageLcp: (parseInt(entry.count) / parseInt(totalEntries)) * 100 });
    }
    return acc;
  }, []) : null;
  const orderedLcpEntries = dedupedEntries ? dedupedEntries.sort((a, b) => b.count - a.count) : null;

  return (
    <>
      {orderedLcpEntries && orderedLcpEntries.length > 0 ? (<img src={orderedLcpEntries[0].url} className='w-full' />) : null}
      <table className="divide-y divide-gray-300 table-fixed w-full">
        <thead>
          <tr>
            <th scope="col" className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900 pl-4">
              Resource
            </th>
            <th scope="col" className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900 pl-4">
              % of Time is LCP
            </th>
            <th scope="col" className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900 pl-4">
              Render time
            </th>
            <th scope="col" className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900 pl-4">
              Duration
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white text-xs">
          {orderedLcpEntries && orderedLcpEntries.map(lcpEntry => (
            <LcpEntryRow key={lcpEntry.url} lcpEntry={lcpEntry} />
          ))}
        </tbody>
      </table>
    </>
  )
}

const LcpEntryRow = ({ lcpEntry }) => {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ followCursor: false, trigger: 'hover' });

  return (
    <tr className="px-4" key={lcpEntry.url}>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-gray-900 sm:pl-6 lg:pl-8 truncate">
        {lcpEntry.url.length > 1 && (
          <>
            <div ref={setTriggerRef}>
              <img src={lcpEntry.url} className='h-12' />
            </div>
            {visible && (
              <>
                <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container max-w-[70%] drop-shadow p-4 z-20 bg-white border break-all border-gray-200 rounded' })}>
                  <div className='tooltip-arrow' {...getArrowProps({ className: 'tooltip-arrow' })} />
                  <div className='text-sm text-gray-700'>
                    <p className='text-sm break-all'>{`${new URL(lcpEntry.url).hostname}${new URL(lcpEntry.url).pathname}`}</p>
                    <img src={lcpEntry.url} className='h-72 m-auto' />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </td>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-gray-900 sm:pl-6 lg:pl-8">
        {lcpEntry.count} ({lcpEntry.percentageLcp?.toFixed(2)}%)
      </td>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-gray-900 sm:pl-6 lg:pl-8">
        {formattedMsOrSeconds(lcpEntry.render_time)}
      </td>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-gray-900 sm:pl-6 lg:pl-8">
        {formattedMsOrSeconds(lcpEntry.duration)}
      </td>
    </tr>
  )
}