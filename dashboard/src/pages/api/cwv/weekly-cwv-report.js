import { createClient } from "@supabase/supabase-js";
import { WeeklyCWVReport } from "@/lib/emails/weekly-cwv-report"
import WebVitalsData from '@/lib/data/webVitals';
import { cwvMetricBounds, calcCwvMetric } from '@lib/cwvCalculations';
import { formattedMsOrSeconds } from '@lib/utils';

const renderMetric = (value, status) => {
  const color =
    status === 'Passed' ? '#10B981' : 
    status === 'Needs Improvement' ? '#EAB308' :
    '#F43F5E';
  return `<span style="color:${color};font-size:1.5em;font-weight:bold;">${value}</span>`;
};

const renderPreviousMetric = (value, status) => {
  const color =
    status === 'Passed' ? '#10B981' : 
    status === 'Needs Improvement' ? '#EAB308' :
    '#F43F5E';
  return `<p style="font-size:1.25em;"><span style="color:${color};">${value}</span> last week</p>`;
} 

const queryAllDataForRumReport = async (projectKey,  urlHost, urlPath, metrics = ['LCP', 'FCP', 'TTFB', 'CLS', 'FID', 'INP']) => {
    
  try {
    //console.log(projectKey, urlHost, urlPath, metrics);
    const startTs = Date.now() - 1000 * 60 * 60 * 24 * 7;
    const startTsTwo = Date.now() - 1000 * 60 * 60 * 24 * 14;

    const sqlQueries = metrics.map(
      metric => WebVitalsData.getPercentileForMetric({ projectKey, urlHost, urlPath, metric, percentile: 0.75, startTs })
    );
    const sqlQueries2 = metrics.map(
      metric => WebVitalsData.getPercentileForMetric({ projectKey, urlHost, urlPath, metric, percentile: 0.75, startTs: startTsTwo })
    );
    const results = await Promise.all(sqlQueries);
    const results2 = await Promise.all(sqlQueries2);
    const resultsByMetric = results.reduce((acc, result, i) => {
      const metric = metrics[i];
      const status = result.value <= cwvMetricBounds[metric].good ? 'Passed' :
        result.value <= cwvMetricBounds[metric].medium ? 'Needs Improvement' : 'Failing';
        
        let varMetrics = calcCwvMetric(result.value, metric)
        console.log('varMetrics: ', varMetrics)

        acc[metric] = {
        current: metric === 'CLS' ? parseFloat(result.value).toFixed(4) : formattedMsOrSeconds(result.value),
        previous:  metric === 'CLS' ? parseFloat(results2[i].value).toFixed(4) : formattedMsOrSeconds(results2[i].value),
        status: status,
        change: (((results2[i].value - result.value)/results2[i].value)*100).toFixed(2),
        weightedScore: varMetrics.weightedScore,
      }
      //console.log('acc: ', acc); 
      return acc;
    }, {});
    return  resultsByMetric;
    //return res.status(200).json({ groupedBy: groupBy, results: resultsByMetric });
  } catch (err) {
    console.error(err);
    throw err; 
    //return res.status(500).json({ error: err.message });
  }
}

export default async function (req, res) {
  const { cadence, k } = req.query;
  if (k !== process.env.CRON_JOB_API_KEY) {
    console.error('Reporting: Unauthorized Access'); 
    return res.status(403).json({ message: 'Reporting: Unauthorized.' })
  } else {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_GOD_MODE_KEY);

    const { data, error } = await supabase
                                    .from('project_report_urls')
                                    .select('*, projects:project_id (public_id)')
                                    .eq('cadence', cadence)
                                    .eq('enabled', true);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Error fetching report configurations" });
    } else {
      console.log(`Enqueuing ${data.length} weekly reports.`);
      console.log('Reports Queued:', data);
      if(data[0].data_type === 'rum') {
        try {
          let emailData = await queryAllDataForRumReport(data[0].projects.public_id, data[0].url_host, data[0].url_path);
          //console.log('Email Data:', emailData) 
          let weightedSum = 0;
          let hasFailingMetrics = false; 
          Object.entries(emailData).forEach(([key, value]) => { 
            weightedSum += value.weightedScore;           
            if(value.status == 'Failing') {
              hasFailingMetrics = true
            }
          })

          // wieghted score is greater than 90 && no failing metrics
          let reportStatus = 'Failing'; 
          let reportImage = 'https://swishjam.com/failing.png';
          if(weightedSum >= 90 && !hasFailingMetrics) {
            // status is passed
            reportStatus = 'Passed';
            reportImage = 'https://swishjam.com/passed.png';
          } else if(weightedSum < 70 && hasFailingMetrics) {
            // status is Needs Improvement if failing metrics or below 90 but above 70
            reportStatus = 'Needs Improvement';
            reportImage = 'https://swishjam.com/needs-improvement.png';
          } else {
            // status is failed if failing metrics or below 70
          }

          WeeklyCWVReport.send({ to: "zach@swishjam.com", variables: {
            siteUrl: data[0].full_url,
            status: reportStatus,
            statusImg: reportImage, 
            lcp: renderMetric(emailData.LCP.current, emailData.LCP.status),
            lcpChange: renderPreviousMetric(emailData.LCP.previous, emailData.LCP.status),
            cls: renderMetric(emailData.CLS.current, emailData.CLS.status),
            clsChange: renderPreviousMetric(emailData.CLS.previous, emailData.CLS.status),
            inp: renderMetric(emailData.INP.current, emailData.INP.status),
            inpChange: renderPreviousMetric(emailData.INP.previous, emailData.INP.status),
            fcp: renderMetric(emailData.FCP.current, emailData.FCP.status),
            fcpChange: renderPreviousMetric(emailData.FCP.previous, emailData.FCP.status),
            ttfb: renderMetric(emailData.TTFB.current, emailData.TTFB.status), 
            ttfbChange: renderPreviousMetric(emailData.TTFB.previous, emailData.TTFB.status), 
            fid: renderMetric(emailData.FID.current, emailData.FID.status),
            fidChange: renderPreviousMetric(emailData.FID.previous, emailData.FID.status), 
          }});
        } catch(err) {
          console.error(err);
          return res.status(200).json({ success: false, message: err });
        }
        return res.status(200).json({ success: true, message: `Enqueued ${data.length} reports sent.` });
      }
    }

  }
}