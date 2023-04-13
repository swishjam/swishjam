import LighthouseScore from "./LighthouseScore";
import LighthouseAuditResultRow from "./LighthouseAuditResultRow";
import { CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

const goodScoreShape = <div className='w-2 h-2 rounded-full bg-green-700' />;
const okScoreShape = <div className='w-2 h-2 bg-yellow-500' />;
const badScoreShape = (
  <div 
    style={{ borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '10px solid red', width: '10px', height: '10px' }}
  />
)
export default function LighthouseSection({ webPageTestResults }) {
  const { opportunities, diagnostics, passing } = webPageTestResults.lighthouseAudits();
  
  const fcp = webPageTestResults.getLighthouseAudit('first-contentful-paint');
  const speedIndex = webPageTestResults.getLighthouseAudit('speed-index');
  const lcp = webPageTestResults.getLighthouseAudit('largest-contentful-paint');
  const tti = webPageTestResults.getLighthouseAudit('interactive');
  const tbt = webPageTestResults.getLighthouseAudit('total-blocking-time');
  const cls = webPageTestResults.getLighthouseAudit('cumulative-layout-shift');

  return (
    <>
      <div className='text-center mb-2'>
        <LighthouseScore score={webPageTestResults.lighthouseScore('performance')} size='large' />
      </div>
      <div className='grid grid-cols-6 gap-2 mb-4 flex items-center'>
        <div className='col-span-1 flex items-center'>
          <div className='mr-2'>
            {fcp.score < 0.50 ? badScoreShape : fcp.score < 0.90 ? okScoreShape : goodScoreShape}
          </div>
          <div>
            <h3 className='text-sm font-medium text-gray-900'>First Contentful Paint</h3>
            <h2 className={`text-4xl font-bold block ${fcp.score < 0.50 ? 'text-red-600' : fcp.score < 0.90 ? 'text-yellow-500' : 'text-green-700'}`}>{fcp.displayValue}</h2>
          </div>
        </div>
        <div className='col-span-1 flex items-center'>
          <div className='mr-2'>
            {speedIndex.score < 0.50 ? badScoreShape : speedIndex.score < 0.90 ? okScoreShape : goodScoreShape}
          </div>
          <div>
            <h3 className='text-sm font-medium text-gray-900'>Speed Index</h3>
            <h2 className={`text-4xl font-bold block ${speedIndex.score < 0.50 ? 'text-red-600' : speedIndex.score < 0.90 ? 'text-yellow-500' : 'text-green-700'}`}>{speedIndex.displayValue}</h2>
          </div>
        </div>
        <div className='col-span-1 flex items-center'>
          <div className='mr-2'>
            {lcp.score < 0.50 ? badScoreShape : lcp.score < 0.90 ? okScoreShape : goodScoreShape}
          </div>
          <div>
            <h3 className='text-sm font-medium text-gray-900'>Largest Contentful Paint</h3>
            <h2 className={`text-4xl font-bold block ${lcp.score < 0.50 ? 'text-red-600' : lcp.score < 0.90 ? 'text-yellow-500' : 'text-green-700'}`}>{lcp.displayValue}</h2>
          </div>
        </div>
        <div className='col-span-1 flex items-center'>
          <div className='mr-2'>
            {tti.score < 0.50 ? badScoreShape : tti.score < 0.90 ? okScoreShape : goodScoreShape}
          </div>
          <div>
            <h3 className='text-sm font-medium text-gray-900'>Time to Interactive</h3>
            <h2 className={`text-4xl font-bold block ${tti.score < 0.50 ? 'text-red-600' : tti.score < 0.90 ? 'text-yellow-500' : 'text-green-700'}`}>{tti.displayValue}</h2>
          </div>
        </div>
        <div className='col-span-1 flex items-center'>
          <div className='mr-2'>
            {tbt.score < 0.50 ? badScoreShape : tbt.score < 0.90 ? okScoreShape : goodScoreShape}
          </div>
          <div>
            <h3 className='text-sm font-medium text-gray-900'>Total Blocking Time</h3>
            <h2 className={`text-4xl font-bold block ${tbt.score < 0.50 ? 'text-red-600' : tbt.score < 0.90 ? 'text-yellow-500' : 'text-green-700'}`}>{tbt.displayValue}</h2>
          </div>
        </div>
        <div className='col-span-1 flex items-center'>
          <div className='mr-2'>
            {cls.score < 0.50 ? badScoreShape : cls.score < 0.90 ? okScoreShape : goodScoreShape}
          </div>
          <div>
            <h3 className='text-sm font-medium text-gray-900'>Cumulative Layout Shift</h3>
            <h2 className={`text-4xl font-bold block ${cls.score < 0.50 ? 'text-red-600' : cls.score < 0.90 ? 'text-yellow-500' : 'text-green-700'}`}>{cls.displayValue}</h2>
          </div>
        </div>
      </div>
      <div className='mb-8'>
        <h2 className='text-lg mb-4'>Opportunities ({opportunities.length})</h2>
        {opportunities.sort((a, b) => b.details.overallSavingsMs - a.details.overallSavingsMs )
                        .map(({ title, description, details, numericValue, numericUnit, displayValue, scoreDisplayMode }) => (
          <LighthouseAuditResultRow 
            key={title} 
            icon={
              scoreDisplayMode === 'informative' 
                ? <InformationCircleIcon className='h-6 w-6 ml-2 text-blue-600' /> 
                : <ExclamationCircleIcon className='h-6 w-6 ml-2 text-red-600' />
            }
            scoreDisplayMode={scoreDisplayMode}
            title={title} 
            description={description} 
            details={details} 
            numericValue={numericValue} 
            numericUnit={numericUnit} 
            displayValue={displayValue}
          />
        ))}
      </div>
      <div className='mb-8'>
        <h2 className='text-lg mb-4'>Diagnostics ({diagnostics.length})</h2>
        {diagnostics.sort((a, b) => a.scoreDisplayMode.localeCompare(b.scoreDisplayMode))
                      .map(({ title, description, details, numericValue, numericUnit, displayValue, scoreDisplayMode }) => (
          <LighthouseAuditResultRow
            key={title}
            icon={
              scoreDisplayMode  === 'informative' 
                  ? <InformationCircleIcon className='h-6 w-6 ml-2 text-blue-600' /> 
                  : <ExclamationTriangleIcon className='h-6 w-6 ml-2 text-yellow-500' />
            }
            scoreDisplayMode={scoreDisplayMode}
            title={title}
            description={description}
            details={details}
            numericValue={numericValue}
            numericUnit={numericUnit}
            displayValue={displayValue}
          />
        ))}
      </div>
      <div className='mb-4'>
        <h2 className='text-lg mb-4'>Passing ({passing.length})</h2>
        {passing.map(({ title, description, details, numericValue, numericUnit, displayValue, scoreDisplayMode }) => (
          <LighthouseAuditResultRow
            key={title}
            icon={
              scoreDisplayMode  === 'informative' 
                  ? <InformationCircleIcon className='h-6 w-6 ml-2 text-blue-600' /> 
                  : <CheckCircleIcon className='h-6 w-6 ml-2 text-green-600' />
            }
            title={title}
            description={description}
            details={details}
            numericValue={numericValue}
            numericUnit={numericUnit}
            displayValue={displayValue}
          />
        ))}
      </div>
    </>
  )
}