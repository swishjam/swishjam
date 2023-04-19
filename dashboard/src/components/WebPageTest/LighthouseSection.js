import { useState } from "react";
import LighthouseScore from "./LighthouseScore";
import LighthouseAuditResultRow from "./LighthouseAuditResultRow";
import MarkdownText from "../MarkdownText";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { formattedMsOrSeconds } from "@/lib/utils";
import LoadingSpinner from "../LoadingSpinner";

const GoodScoreShape = () => <div className='w-2 h-2 rounded-full bg-green-700' />;
const OkScoreShape = () => <div className='w-2 h-2 bg-yellow-500' />;
const BadScoreShape = () => <div style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '10px solid red' }} />;

function Metric({ audit, isExpanded }) {
  return (
    <>
      <div className='flex border-t border-gray-200 p-2'>
        <div className='absolute mr-2 mt-2'>
          {audit.score < 0.50 ? <BadScoreShape /> : audit.score < 0.90 ? <OkScoreShape /> : <GoodScoreShape />}
        </div>
        <div className='pl-8'>
          <h3 className='text-sm font-medium text-gray-900'>{audit.title}</h3>
          <h2 className={`text-4xl block ${audit.score < 0.50 ? 'text-red-600' : audit.score < 0.90 ? 'text-yellow-500' : 'text-green-700'}`}>{audit.displayValue}</h2>
          {isExpanded && <p className='text-sm text-gray-500 mt-2'>{<MarkdownText text={audit.description} />}</p>}
        </div>
      </div>
    </>
  )
}

export default function LighthouseSection({ webPageTestResults }) {
  const [metricsExpanded, setMetricsExpanded] = useState(false);
  const [passingSectionIsExpanded, setPassingSectionIsExpanded] = useState(false);

  const { opportunities = [], diagnostics = [], passing = [] } = webPageTestResults ? webPageTestResults.lighthouseAudits() : {};
  
  return (
    <>
      {!webPageTestResults
        ? (
          <div className='text-center p-6'>
            <h2 className='text-xl text-gray-700'>Performing Lighthouse audit...</h2>
            <h2 className='text-md text-gray-500'>This may take a few minutes.</h2>
            <div className='w-fit m-auto mt-4'>
              <LoadingSpinner size={8} />
            </div>
          </div>
        ) 
        : webPageTestResults.lighthouseFailed() 
          ? (
            <div className='border-red-600 bg-red-100 text-red-600 text-center p-4 text-md'>
              Lighthouse audit was unable to successfully complete.
            </div>
          )
          : (
            <div className='max-w-4xl m-auto'>
              <div className='text-center mb-2'>
                <h2 className='text-2xl'>Performance Score</h2>
                <LighthouseScore score={webPageTestResults.lighthouseScore('performance')} size='large' />
                {webPageTestResults.lighthouseWarnings().length > 0 && (
                  <div className='text-sm text-red-600 bg-red-100 p-2 rounded-md w-fit m-auto'>
                    {webPageTestResults.lighthouseWarnings().map((msg, i) => <p key={i} className='m-1'>{msg}</p>)}
                  </div>
                )}
              </div>
              <div className='flex justify-end'>
                <span 
                  onClick={() => setMetricsExpanded(!metricsExpanded)}
                  className='text-sm text-gray-500 mb-2 cursor-pointer hover:underline'
                >
                  {metricsExpanded ? 'Collapse' : 'Expand'}
                </span>
              </div>
              <div className='grid grid-cols-2 gap-2 mb-4 flex items-center'>
                <Metric audit={webPageTestResults.getLighthouseAudit('first-contentful-paint')} isExpanded={metricsExpanded} />
                <Metric audit={webPageTestResults.getLighthouseAudit('interactive')} isExpanded={metricsExpanded} />
                <Metric audit={webPageTestResults.getLighthouseAudit('speed-index')} isExpanded={metricsExpanded} />
                <Metric audit={webPageTestResults.getLighthouseAudit('total-blocking-time')} isExpanded={metricsExpanded} />
                <Metric audit={webPageTestResults.getLighthouseAudit('largest-contentful-paint')} isExpanded={metricsExpanded} />
                <Metric audit={webPageTestResults.getLighthouseAudit('cumulative-layout-shift')} isExpanded={metricsExpanded} />
              </div>
              <div className='flex justify-space mb-4 max-w-full h-32 overflow-x-scroll'>
                {webPageTestResults.getLighthouseAudit('screenshot-thumbnails').details.items.map(({ timing, data }, i) => (
                  <div className='m-1 text-center' key={i}>
                    <img src={data} className='border border-gray-100 rounded' />
                    <span className='text-xs text-gray-500'>{formattedMsOrSeconds(timing)}</span>
                  </div>
                ))}
              </div>
              <div className='mb-8'>
                <h2 className='text-lg mb-4'>Opportunities ({opportunities.length})</h2>
                {opportunities.sort((a, b) => b.details.overallSavingsMs - a.details.overallSavingsMs )
                                .map(({ title, description, details, numericValue, numericUnit, displayValue, scoreDisplayMode }) => (
                  <LighthouseAuditResultRow 
                    key={title} 
                    icon={
                      scoreDisplayMode === 'informative' 
                          ? <InformationCircleIcon className='h-4 w-4 ml-2 text-blue-600' /> 
                          :  details.overallSavingsMs > 999 ? <BadScoreShape /> : <OkScoreShape />
                    }
                    displayVisualEstimatedSavings={true}
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
                {diagnostics.sort((a, b) => a.scoreDisplayMode === 'informative' ? 1 : -1)
                              .map(({ title, description, details, displayValue, scoreDisplayMode }) => (
                  <LighthouseAuditResultRow
                    key={title}
                    icon={scoreDisplayMode  === 'informative' ? <InformationCircleIcon className='h-4 w-4 text-blue-600' /> : <BadScoreShape />}
                    scoreDisplayMode={scoreDisplayMode}
                    title={title}
                    subTitle={displayValue}
                    subTitleColor={scoreDisplayMode === 'informative' ? 'text-gray-600' : 'text-red-600'}
                    description={description}
                    details={details}
                  />
                ))}
              </div>
              <div className='mb-4'>
                <div className='flex justify-between'>
                  <h2 className='text-lg mb-4'>Passing ({passing.length})</h2>
                  <span 
                    onClick={() => setPassingSectionIsExpanded(!passingSectionIsExpanded)} 
                    className='text-sm text-gray-700 cursor-pointer hover:underline'
                  >
                    {passingSectionIsExpanded ? 'Hide' : 'Show'}
                  </span>
                </div>
                <div className={passingSectionIsExpanded ? '' : 'h-0 overflow-hidden border border-t border-gray-200'}>
                  {passing.map(({ title, description, details, displayValue, scoreDisplayMode }) => (
                    <LighthouseAuditResultRow
                      key={title}
                      icon={scoreDisplayMode  === 'informative' ? <InformationCircleIcon className='h-6 w-6 ml-2 text-blue-600' /> : <GoodScoreShape />}
                      title={title}
                      subTitle={displayValue}
                      subTitleColor={'text-green-600'}
                      description={description}
                      details={details}
                    />
                  ))}
                </div>
              </div>
            </div>
          )
      }
    </>
  )
}