// 'use client';
// import AuthenticatedView from '@/components/AuthenticatedView';
// import { AreaChart, BarList, Card, Title, Flex, Text, Bold } from '@tremor/react';
// import { useEffect, useState } from "react";
// import { msToSeconds } from "@/lib/utils";
// // import { GetPagesForCWVMetric, GetCWVTimeSeriesData } from "@/lib/api";
// import LoadingSpinner from '@/components/LoadingSpinner';

// const loadingIndicator = () => {
//   return (
//     <div className='flex'>
//       <div className='m-auto'>
//         <LoadingSpinner size={8} />
//       </div>
//     </div>
//   )
// }

// const DEFINITIONS = {
//   LCP: "Measures the page's perceived load speed. It marks the point in the page load timeline when the page's main content has likely loaded — a fast LCP helps reassure the user that the page is useful.",
//   CLS: "Measures the page's visual stability. It helps quantify how often users experience unexpected layout shifts — a low CLS helps ensure that the page is delightful.",
//   FID: "Measures the page's load responsiveness. It quantifies the experience users feel when trying to interact with unresponsive pages — a low FID helps ensure that the page is usable.",
//   FCP: "Measures the page's perceived load speed. It marks the first point in the page load timeline where the user can see anything on the screen — a fast FCP helps reassure the user that something is happening.",
//   INP: "An experimental metric that assesses page responsiveness. When an interaction causes a page to become unresponsive, that is a poor user experience. INP observes the latency of all interactions a user has made with the page, and reports a single value which all (or nearly all) interactions were below. A low INP means the page was consistently able to respond quickly to all—or the vast majority—of user interactions.",
//   TTFB: "Measures connection setup time and web server responsiveness. It helps identify when a web server is too slow to respond to requests. In the case of navigation requests—that is, requests for an HTML document—it precedes every other meaningful loading performance metric."
// }

// export default function Cwv({ params }) {
//   const { measurement } = params;
//   const [pages, setPages] = useState();
//   const [timeseriesData, setTimeseriesData] = useState();
//   const valueFormatter = value => measurement === 'CLS' ? Number.parseFloat(value).toFixed(4) : `${msToSeconds(value)} s`;

//   useEffect(() => {
//     GetPagesForCWVMetric({ siteId: 'sj-syv3hiuj0p51nks5', metric: measurement }).then(res => {
//       const formatted = res.records.map(record => ({ ...record, href: `/pages/${encodeURIComponent(record.name)}` }))
//       setPages(formatted)
//     });
//     GetCWVTimeSeriesData({ siteId: 'sj-syv3hiuj0p51nks5', metric: measurement }).then(chartData => setTimeseriesData(chartData));
//   }, []);

//   return (
//     <>
//       <AuthenticatedView>
//         <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
//           <h1 className="text-lg font-medium mt-8">{measurement}</h1>
//           {/* <h2 className='text-sm font-small mt-1 font-grey-300'>{DEFINITIONS[measurement]}</h2> */}
//           <div className='mt-6'>
//             <Card>
//               {timeseriesData === undefined ?
//                 loadingIndicator() :
//                 <AreaChart
//                   data={timeseriesData}
//                   dataKey="timestamp"
//                   categories={['p90']}
//                   colors={['blue']}
//                   showLegend={false}
//                   startEndOnly={true}
//                   valueFormatter={value => measurement === 'CLS' ? Number.parseFloat(value).toFixed(4) : `${msToSeconds(value)} s`}
//                   height="h-48"
//                   marginTop="mt-10"
//                 />
//               }
//             </Card>
//           </div>
//           <div className='mt-6'>
//             <Card>
//               <Title>Worst performing pages by {measurement}.</Title>
//               <Flex marginTop="mt-4">
//                 <Text><Bold>Pages</Bold></Text>
//                 <Text><Bold>Average {measurement}</Bold></Text>
//               </Flex>
//               {pages === undefined ?
//                 loadingIndicator() :
//                 <BarList data={pages} valueFormatter={valueFormatter} marginTop='mt-4' color='blue' />
//               }
//             </Card>
//           </div>
//         </main>
//       </AuthenticatedView>
//     </>
//   );
// }