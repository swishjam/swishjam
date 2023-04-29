'use client';

import { useState } from 'react';
import AuthenticatedView from '@/components/AuthenticatedView';
import { useAuth } from '@components/AuthProvider';
import { LabTestsAPI } from '@/lib/api-client/lab-tests';
import HostUrlFilterer from '@/components/Filters/HostUrlFilterer';
import PathUrlFilterer from '@/components/Filters/PathUrlFilterer';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { bytesToHumanFileSize } from '@/lib/utils';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white w-fit py-4 px-8 relative border border-gray-300 rounded-lg min-w-72 focus:ring-0">
        <div className='w-full mb-2'>
          <span className="text-xs text-gray-400 right-0 top-0">{label}</span>
        </div>
        <h3 className='text-2xl font-bold text-gray-600 flex items-center'>
          {bytesToHumanFileSize(payload[0].value)}
          {/* {JSON.stringify(payload)} */}
        </h3>
      </div>
    );
  }
};

export default function BytesBreakdown() {
  const { currentProject } = useAuth();
  const [hasNoData, setHasNoData] = useState(false);
  const [hostUrlToFilterOn, setHostUrlToFilterOn] = useState();
  const [labTests, setLabTests] = useState();

  const getLabDataForUrlHostAndPath = (urlHost, urlPath) => {
    setLabTests();
    const params = { urlHost, urlPath };
    if (urlPath === 'All Paths' || !urlPath) delete params.urlPath;
    LabTestsAPI.getAll(params).then(labTests => {
      const formattedLabTests = (labTests || []).map(labTest => {
        const { completed_at, html_bytes, javascript_bytes, css_bytes, image_bytes, font_bytes, video_bytes, other_bytes } = labTest;
        return {
          date: new Date(completed_at).toLocaleDateString(),
          html_bytes,
          javascript_bytes,
          css_bytes,
          image_bytes,
          font_bytes,
          video_bytes,
          other_bytes,
        }
      });
      setLabTests(formattedLabTests);
    });
  }

  return (
    <AuthenticatedView>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className='my-8 flex items-center grid grid-cols-2'>
          <div>
            <h1 className="text-lg font-medium">Lab tests for {currentProject?.name}</h1>
          </div>
          <div className={`w-full flex items-center justify-end ${hasNoData ? 'hidden' : ''}`}>
            <HostUrlFilterer
              urlHostAPI='lab'
              onNoHostsFound={() => setHasNoData(true)}
              onHostsFetched={() => {
                setHasNoData(false);
                setLabTests();
                setHostUrlToFilterOn();
              }}
              onHostSelected={hostUrl => {
                setHasNoData(false)
                setLabTests();
                setHostUrlToFilterOn(hostUrl);
              }}
            />
            <div className='inline-block ml-2'>
              <PathUrlFilterer
                urlHost={hostUrlToFilterOn}
                urlPathAPI='lab'
                includeAllPathsSelection={true}
                onPathSelected={urlPath => getLabDataForUrlHostAndPath(hostUrlToFilterOn, urlPath)}
              />
            </div>
          </div>
        </div>
        <div className='my-8 h-72'>
          {labTests && <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              width={500}
              height={400}
              data={labTests}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={'completed_at'} tick={{ fontSize: '10px', color: 'darkgrey' }} />
              <YAxis tick={{ fontSize: '10px', color: 'darkgrey' }} tickFormatter={bytesToHumanFileSize} />
              {/* <Tooltip content={<CustomTooltip />} /> */}
              <Tooltip />
              <Area type="monotone" dataKey="html_bytes" stackId="1" stroke="lightblue" fill="lightblue" />
              <Area type="monotone" dataKey="css_bytes" stackId="1" stroke="green" fill="green" />
              <Area type="monotone" dataKey="javascript_bytes" stackId="1" stroke="red" fill="red" />
              <Area type="monotone" dataKey="image_bytes" stackId="1" stroke="purple" fill="purple" />
              <Area type="monotone" dataKey="font_bytes" stackId="1" stroke="orange" fill="orange" />
              <Area type="monotone" dataKey="video_bytes" stackId="1" stroke="black" fill="black" />
              <Area type="monotone" dataKey="other_bytes" stackId="1" stroke="gray" fill="gray" />
            </AreaChart>
          </ResponsiveContainer>}
        </div>
      </main>
    </AuthenticatedView>
  )
}