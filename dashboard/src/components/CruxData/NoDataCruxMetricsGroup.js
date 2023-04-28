import { useState, useEffect } from "react";
import { AreaChart } from "@tremor/react";
import { formattedDate } from "@/lib/utils";

const randomDate = () => {
  const start = new Date(2021, 0, 1);
  const end = new Date(2021, 0, 30);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const randomNumberBetween = (min, max) => Math.random() * (max - min) + min;

export default function NoDataCruxMetricsGroup({ friendlyUrl, onLighthouseAuditNavigation, shouldPromptUserToRegister }) {
  const [isHovered, setIsHovered] = useState(false);
  const [timeseriesData, setTimeseriesData] = useState();
  const [goodPercent, setGoodPercent] = useState();
  const [needsImprovementPercent, setNeedsImprovementPercent] = useState();
  const [poorPercent, setPoorPercent] = useState();
  const [p75MarginLeftPercent, setP75MarginLeftPercent] = useState();

  useEffect(() => {
    const randomizedTimeseriesData = Array.from({ length: 30 }).map(() => { 
      const randomizedDate = randomDate();
      return {
        P75: randomNumberBetween(0, 100).toFixed(2), 
        formattedDate: formattedDate(randomizedDate),
        date: randomizedDate
      }
    }).sort((a, b) => a.date - b.date);
    setTimeseriesData(randomizedTimeseriesData);
    
    const randomizedGoodPercent = randomNumberBetween(50, 100);
    const randomizedNeedsImprovementPercent = randomNumberBetween(0, 100 - randomizedGoodPercent);
    const randomizedPoorPercent = 100 - randomizedGoodPercent - randomizedNeedsImprovementPercent;
    setGoodPercent(randomizedGoodPercent);
    setNeedsImprovementPercent(randomizedNeedsImprovementPercent);
    setPoorPercent(randomizedPoorPercent);

    setP75MarginLeftPercent(randomNumberBetween(0, 100))
  }, [])


  return (
    <div className="relative" onMouseOver={() => setIsHovered(true)} onMouseOut={() => setIsHovered(false)}>
      <div className={`absolute z-20 h-full w-full flex items-center justify-center text-center ${isHovered ? '' : 'hidden'}`}>
        <div>
          <span className='block text-md font-md'>
            {friendlyUrl} does not meet the criteria for Chrome's real user performance data.
          </span>
          {shouldPromptUserToRegister && (
            <>
              <span className='block text-sm mb-2'>
                Consider signing up for a <a href='https://app.swishjam.com' target='_blank' className='underline'>Swishjam account</a> and installing our JS snippet to monitor your real user performance data.
              </span>
              <span className='block text-sm'>
                <span className='cursor-pointer underline' onClick={onLighthouseAuditNavigation}>View Lighthouse Audit</span> in the meantime.
              </span>
            </>  
          )}
        </div>
      </div>
      <div className={`relative transition ${isHovered ? 'blur-md' : 'blur-sm'}`}>
        <AreaChart
          height="h-40"
          data={timeseriesData || [{}]}
          dataKey="formattedDate"
          showYAxis={false}
          showXAxis={false}
          showLegend={false}
          showTooltip={false}
          categories={['P75']}
          colors={['blue']}
        />
        <div className='w-full flex justify-center'>
          <div className='flex my-6 h-10 w-[90%] relative'>
            <div
              className={`h-[150%] text-xs text-right absolute w-0 bottom-0 left-0 border-r border-dashed border-slate-600 font-medium`}
              style={{ marginLeft: `${p75MarginLeftPercent}%` }}
            />
            {typeof goodPercent === 'number' && <div className='bg-green-500 h-full' style={{ width: `${goodPercent}%` }} />}
            {typeof needsImprovementPercent === 'number' && <div className='bg-yellow-500 h-full' style={{ width: `${needsImprovementPercent}%` }} />}
            {typeof poorPercent === 'number' && <div className='bg-red-500 h-full' style={{ width: `${poorPercent}%` }} />}
          </div>
        </div>
      </div>
    </div>
  )
}