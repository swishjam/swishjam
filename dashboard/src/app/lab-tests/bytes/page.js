'use client';

import { useState } from 'react';
import AuthenticatedView from '@/components/AuthenticatedView';
import { useAuth } from '@components/AuthProvider';
import { LabTestsAPI } from '@/lib/api-client/lab-tests';
import HostUrlFilterer from '@/components/Filters/HostUrlFilterer';
import PathUrlFilterer from '@/components/Filters/PathUrlFilterer';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { bytesToHumanFileSize } from '@/lib/utils';
import { BeakerIcon } from '@heroicons/react/24/outline';

const BytesChart = ({ labTests }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        width={500}
        height={400}
        data={labTests}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <Legend />
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={'completed_at'} tick={{ fontSize: '10px', color: 'darkgrey' }} />
        <YAxis tick={{ fontSize: '10px', color: 'darkgrey' }} tickFormatter={bytesToHumanFileSize} />
        <Tooltip content={<CustomTooltip />} />
        <Tooltip />
        <Area type="monotone" dataKey="HTML" stackId="1" stroke="lightblue" fill="lightblue" />
        <Area type="monotone" dataKey="CSS" stackId="1" stroke="green" fill="green" />
        <Area type="monotone" dataKey="JavaScript" stackId="1" stroke="red" fill="red" />
        <Area type="monotone" dataKey="Image" stackId="1" stroke="purple" fill="purple" />
        <Area type="monotone" dataKey="Font" stackId="1" stroke="orange" fill="orange" />
        <Area type="monotone" dataKey="Video" stackId="1" stroke="black" fill="black" />
        <Area type="monotone" dataKey="Other" stackId="1" stroke="gray" fill="gray" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const reversedPayload = payload.slice().reverse();
    return (
      <div className="custom-tooltip bg-white w-fit py-4 px-8 relative border border-gray-300 rounded-lg min-w-72 focus:ring-0">
        <div className='w-full mb-2'>
          <span className="text-xs text-gray-400 right-0 top-0">{label}</span>
        </div>
        {reversedPayload.map(({ color, name, value }) => {
          return (
            <h3 className='text-lg font-medium flex items-center' style={{ color: color }}>
              {name}: {bytesToHumanFileSize(value)}
            </h3>
          )
        })}
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
          HTML: html_bytes,
          JavaScript: javascript_bytes,
          CSS: css_bytes,
          Image: image_bytes,
          Font: font_bytes,
          Video: video_bytes,
          Other: other_bytes,
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
          {labTests === undefined 
            ? (
              <div className='w-full h-full animate-pulse bg-gray-200 rounded-m' />
            ) : labTests.length === 0 
              ? (
                <a
                  type="button"
                  className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  href='/lab-tests/manage'
                >
                  <BeakerIcon className='mx-auto h-12 w-12 text-gray-700' />
                  <span className="mt-2 block text-md font-semibold text-gray-700">No lab tests have run yet.</span>
                  <span className="mt-2 block text-sm font-semibold text-gray-700">Manage your lab test configuration.</span>
                </a>
              ) : <BytesChart labTests={labTests} />
          }
        </div>
      </main>
    </AuthenticatedView>
  )
}