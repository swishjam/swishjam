import LcpDetails from './details/Lcp'

export default function CwvDetail({ accronym, urlPath, urlHost }) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div className="col-span-1">
        <h2 className='text-lg'>Mobile</h2>
        {renderCwvDetailsComponent({ accronym, urlHost, urlPath, deviceTypes: ['smartphone', 'phablet', 'tablet']}) }
      </div>
      <div className="col-span-1">
        <h2 className='text-lg'>Desktop</h2>
        {renderCwvDetailsComponent({ accronym, urlHost, urlPath, deviceTypes: ['desktop'] })}
      </div>
    </div>
  )
}

const renderCwvDetailsComponent = ({ accronym, urlPath, urlHost, deviceTypes }) => {
  switch(accronym) {
    case 'LCP':
      return <LcpDetails urlPath={urlPath} urlHost={urlHost} deviceTypes={deviceTypes} />
    case 'FID':
      return;
    case 'CLS':
      return;
    case 'INP':
      return;
    case 'FCP':
      return;
    case 'TTFB':
      return;
  }
}