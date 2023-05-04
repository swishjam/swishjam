'use client';

import { useEffect, useState } from "react";

export default function ScriptResults({ params }) {
  const { id } = params;
  const [requestData, setRequestData] = useState();

  useEffect(() => {
    fetch(`https://www.webpagetest.org/jsonResult.php?test=${id}&breakdown=${1}`)
      .then((res) => res.json())
      .then(async response => {
        if (response.statusCode === 200 && response.data?.median?.firstView?.requests) {
          setRequestData(response.data.median.firstView.requests);
        } else {
          // an error occurred!;
        }
      });
  }, [])

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[50%]">URL</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Script Evaluation Time</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compile Time</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Function Call Time</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200 max-h-96 overflow-y-scroll">
        {requestData && requestData.map(requestDetails => {
          return (typeof requestDetails.cpuTimes?.EvaluateScript === 'number' 
                  || typeof requestDetails.cpuTimes?.['v8.compile'] === 'number' 
                  || typeof requestDetails.cpuTimes?.functionCall === 'number') 
                  && <tr key={requestDetails.id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{requestDetails.full_url.length > 50 ? `${requestDetails.full_url.slice(0, 50)}...` : requestDetails.full_url}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{requestDetails.request_type} {requestDetails.renderBlocking && `(${requestDetails.renderBlocking})`}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{requestDetails.cpuTimes?.EvaluateScript}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{requestDetails.cpuTimes?.['v8.compile']}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{requestDetails.cpuTimes?.FunctionCall}</div>
            </td>
          </tr>
        })}
      </tbody>
    </table >
  )
}