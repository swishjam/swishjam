import { formattedMsOrSeconds } from "@/lib/utils";

const GOOD_LCP = 2_500;
const NEEDS_IMPROVEMENT_LCP = 4_000;
const MAX_LCP_VALUE = NEEDS_IMPROVEMENT_LCP + Math.min(GOOD_LCP, NEEDS_IMPROVEMENT_LCP - GOOD_LCP);

export default function GoodNeedsImprovementPoor({ lcpValue }) {
  const lcpGrade = lcpValue <= GOOD_LCP ? 'good' : lcpValue <= NEEDS_IMPROVEMENT_LCP ? 'needs improvement' : 'poor';
  const lcpColor = lcpGrade === 'good' ? 'green' : lcpGrade === 'needs improvement' ? 'yellow' : 'red';
  return (
    <div className='mx-4 h-1/2'>
      <h1 className='text-lg'>Your Largest Contentful Paint is <span className='font-bold'>{formattedMsOrSeconds(lcpValue)}</span></h1>
      <h2 className='text-sm mb-8'>This is considered as <span className={`text-${lcpColor}-600 font-medium`}>{lcpGrade}</span> by core web vital's standards.</h2>
      <div className='relative h-full'>
        <div 
          className={`absolute text-xs font-medium text-${lcpColor}-600 pl-1 h-[125%] border-l-2 border-dashed border-slate-600 bottom-0 z-10 whitespace-nowrap`} 
          style={{ marginLeft: `${Math.min(100, lcpValue / MAX_LCP_VALUE * 100)}%` }}
        >
          {formattedMsOrSeconds(lcpValue)}
        </div>
        <div className='relative h-full rounded-md overflow-hidden'>
          <div className='h-full inline-block bg-green-500 hover:bg-green-600' style={{ width: `${GOOD_LCP / MAX_LCP_VALUE * 100}%` }} />
          <div className='h-full inline-block bg-yellow-400 hover:bg-yellow-500' style={{ width: `${(NEEDS_IMPROVEMENT_LCP - GOOD_LCP) / MAX_LCP_VALUE * 100}%` }} />
          <div className='h-full inline-block bg-red-500 hover:bg-red-600' style={{ width: `${(MAX_LCP_VALUE - NEEDS_IMPROVEMENT_LCP) / MAX_LCP_VALUE * 100}%` }} />
        </div>
        <div className='flex'>
          <div className='inline-block relative text-xs text-gray-700' style={{ width: `${GOOD_LCP / MAX_LCP_VALUE * 100}%` }}>
            <span className='absolute -translate-x-1/2'>
              0 ms
            </span>
          </div>
          <div className='relative inline-block text-xs text-gray-700' style={{ width: `${(NEEDS_IMPROVEMENT_LCP - GOOD_LCP) / MAX_LCP_VALUE * 100}%` }}>
            <span className='absolute -translate-x-1/2'>
              {formattedMsOrSeconds(GOOD_LCP)}
            </span>
          </div>
          <div className='relative inline-block text-xs text-gray-700' style={{ width: `${(MAX_LCP_VALUE - NEEDS_IMPROVEMENT_LCP) / MAX_LCP_VALUE * 100}%` }}>
            <span className='absolute -translate-x-1/2'>
              {formattedMsOrSeconds(NEEDS_IMPROVEMENT_LCP)}
            </span>
          </div>
          <div className='relative inline-block text-xs text-gray-700 w-0 whitespace-nowrap'>
            <span className='absolute -translate-x-1/2'>
              {formattedMsOrSeconds(MAX_LCP_VALUE)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}