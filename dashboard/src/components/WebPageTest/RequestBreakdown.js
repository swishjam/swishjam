import { DonutChart } from "@tremor/react";
import { bytesToHumanFileSize } from "@/lib/utils";
import { Treemap } from "recharts";

function LegendItem({ color, label }) {
  return (
    <div>
      <div className='inline-block rounded-full w-2 h-2' style={{ backgroundColor: color }} />
      <span className='ml-2 text-gray-700 text-sm'>{label}</span>
    </div>
  )
}

const COLORS = ['#8889DD', '#9597E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D'];

function CustomizedContent({ root, depth, x, y, width, height, index, payload, colors, rank, name }) {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: depth < 2 ? colors[Math.floor((index / root.children.length) * 6)] : '#ffffff00',
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {depth === 1 ? (
          <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>
            {name}
          </text>
        ) : null}
        {depth === 1 ? (
          <text x={x + 4} y={y + 18} fill="#fff" fontSize={16} fillOpacity={0.9}>
            {index + 1}
          </text>
        ) : null}
      </g>
    );
}

export default function RequestBreakdown({ webPageTestResults }) {
  const { html, css, js, image, video, font, other } = webPageTestResults.results.data.median.firstView.breakdown
  const formattedRequestTypeData = [
    { name: 'HTML', bytes: html.bytes, color: 'red' },
    { name: 'CSS', bytes: css.bytes, color: 'red' },
    { name: 'JS', bytes: js.bytes, color: 'red' },
    { name: 'Images', bytes: image.bytes, color: 'red' },
    { name: 'Videos', bytes: video.bytes, color: 'red' },
    { name: 'Fonts', bytes: font.bytes, color: 'red' },
    { name: 'Other', bytes: other.bytes, color: 'red' },
  ];

  let formattedTreeMapData = {};
  webPageTestResults.results.data.median.firstView.requests.forEach(request => {
    formattedTreeMapData[request.request_type] = formattedTreeMapData[request.request_type] || [];
    formattedTreeMapData[request.request_type].push({
      name: request.full_url, 
      bytes: request.bytesIn
    })
  })
  formattedTreeMapData = Object.keys(formattedTreeMapData).map(reqType => ({
    name: reqType,
    children: formattedTreeMapData[reqType]
  }));
  console.log(formattedTreeMapData);

  return (
    <>
    <div className='flex items-center'>
      <div className='border border-gray-200 rounded'>
        <h2 className='text-md font-semibold text-gray-900'>Request Breakdown</h2>  
        {formattedRequestTypeData.map(item => <LegendItem key={item.name} color={item.color} label={`${item.name} - ${bytesToHumanFileSize(item.bytes)}`} />)}
      </div>
      <DonutChart
        className="mt-6"
        data={formattedRequestTypeData}
        category="bytes"
        index="name"
        valueFormatter={bytesToHumanFileSize}
        colors={["slate", "violet", "indigo", "rose", "cyan", "amber", 'green']}
        variant='pie'
        showLabel={true}
      />
    </div>
      <Treemap
        data={formattedTreeMapData}
        dataKey="bytes"
        width={700}
        height={700}
        stroke="#fff" 
        // fill="#8884d8"
        aspectRatio={4 / 3}
      />
    </>
  )
}