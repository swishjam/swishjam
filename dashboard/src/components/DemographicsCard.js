import { BarList } from "@tremor/react";
import { calcCwvMetric } from '@/lib/cwvCalculations';
import { metricFormatterPlusUnits } from '@lib/utils';

const CwvBadge = ({metric, cwv}) => {
  if(!metric) {return <></>} 
  
  const metricScore = calcCwvMetric(metric, cwv);
  let colorBg = 'bg-red-100';; 
  let colorText = 'text-red-800';
  if(metricScore.rating === 'pass') {
    colorBg = 'bg-green-100';
    colorText = 'text-green-800';
  }
  if(metricScore.rating === 'average') {
    colorBg = 'bg-yellow-100';
    colorText = 'text-yellow-800';
  }
  return (
    <span className={`inline-flex rounded-full ${colorBg} ${colorText} px-2 text-xs font-semibold leading-5`}>
      {metricFormatterPlusUnits(metric, metricScore.metricScoring.displayUnits || '')} 
    </span> 
  );
}

export default function DemographicsCard({ title, data, sortFunction = (a, b) => b.value - a.value }) {
  let formattedVizData = [];
  let totalCount = 0;
  if(data) {
    totalCount = Object.values(data).reduce((acc, item) => acc + item.totalCount, 0);
    for (const property in data) {
      formattedVizData.push({
        name: property,
        vitals: data[property],
        value: data[property].totalCount
      })
    }
    formattedVizData.sort(sortFunction);
  }

  return (
    <div className='rounded-lg border border-gray-200 p-4 pb-0 h-fit'>
      <h2 className="text-md font-medium mb-4">{title}</h2>
      {data
        ? <BarList data={formattedVizData} valueFormatter={value => `${parseFloat(value / totalCount * 100).toFixed(2) }%`} /> 
        : (
          <>
            <div className="animate-pulse h-10 w-full bg-gray-200 m-1 rounded" />
            <div className="animate-pulse h-10 w-1/3 bg-gray-200 m-1 rounded" />
            <div className="animate-pulse h-10 w-3/4 bg-gray-200 m-1 rounded" />
            <div className="animate-pulse h-10 w-1/6 bg-gray-200 m-1 rounded" />
            <div className="animate-pulse h-10 w-1/2 bg-gray-200 m-1 rounded" />
            <div className="animate-pulse h-10 w-1/6 bg-gray-200 m-1 rounded" />
          </>
        )
      }
      <div className="-mx-4 border-t border-gray-200 mt-4">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-bold text-gray-500">{title}</dt>
            <dt className="text-sm font-bold text-gray-500">Web Vital</dt>
            <dt className="text-sm font-bold text-gray-500">Score</dt>
          </div>
          {data 
            ? formattedVizData.map((item, index) => (
              <div key={index} className={`${index%2 ? 'bg-gray-50':'bg-white'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                <dt className="text-sm font-medium text-gray-500">{item.name}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                  FCP
                </dd>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                  <CwvBadge metric={item.vitals['FCP']?.value} cwv={'FCP'} /> 
                </dd>
                <dt className="text-sm font-medium text-gray-500"></dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                  CLS
                </dd>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                  <CwvBadge metric={item.vitals['CLS']?.value} cwv={'CLS'} /> 
                </dd>
                <dt className="text-sm font-medium text-gray-500"></dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                  FID
                </dd>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                  <CwvBadge metric={item.vitals['FID']?.value} cwv={'FID'} /> 
                </dd>
              </div>
            ))
            : (
              <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
                <div className="h-4 w-12 animate-pulse bg-gray-200 rounded" />
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                  FCP
                </dd>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                  <div className='h-4 w-8 animate-pulse bg-gray-200 rounded-lg' />
                </dd>
                <dt className="text-sm font-medium text-gray-500"></dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                  CLS
                </dd>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                  <div className='h-4 w-8 animate-pulse bg-gray-200 rounded-lg' />
                </dd>
                <dt className="text-sm font-medium text-gray-500"></dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                  FID
                </dd>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                  <div className='h-4 w-8 animate-pulse bg-gray-200 rounded-lg' />
                </dd>
              </div>
            )
          }
        </dl>
      </div>
    </div>
  )
}