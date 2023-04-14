import { useState } from "react";
import LighthouseScore from "./LighthouseScore";
import LighthouseAuditResultRow from "./LighthouseAuditResultRow";
import MarkdownText from "../MarkdownText";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

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

  const { opportunities, diagnostics, passing } = webPageTestResults.lighthouseAudits();
  
  const fcp = webPageTestResults.getLighthouseAudit('first-contentful-paint');
  const speedIndex = webPageTestResults.getLighthouseAudit('speed-index');
  const lcp = webPageTestResults.getLighthouseAudit('largest-contentful-paint');
  const tti = webPageTestResults.getLighthouseAudit('interactive');
  const tbt = webPageTestResults.getLighthouseAudit('total-blocking-time');
  const cls = webPageTestResults.getLighthouseAudit('cumulative-layout-shift');

  return (
    <>
      <div className='max-w-4xl m-auto'>
        <div className='text-center mb-2'>
          <h2 className='text-2xl'>Performance Score</h2>
          <LighthouseScore score={webPageTestResults.lighthouseScore('performance')} size='large' />
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
          <Metric audit={fcp} isExpanded={metricsExpanded} />
          <Metric audit={tti} isExpanded={metricsExpanded} />
          <Metric audit={speedIndex} isExpanded={metricsExpanded} />
          <Metric audit={tbt} isExpanded={metricsExpanded} />
          <Metric audit={lcp} isExpanded={metricsExpanded} />
          <Metric audit={cls} isExpanded={metricsExpanded} />
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
          <h2 className='text-lg mb-4'>Passing ({passing.length})</h2>
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
    </>
  )
}