import { createClient } from "@supabase/supabase-js";
import { WeeklyCWVReport } from "@/lib/emails/weekly-cwv-report"
//import { WebPageTestRunner } from "@/lib/web-page-test/web-page-test-runner";

const renderMetric = (value, status) => {
  const color =
    status === 'Passed' ? '#10B981' : 
    status === 'Needs Improvement' ? '#EAB308' :
    '#F43F5E';
  return `<span style="color:${color};font-size:1.5em;font-weight:bold;">${value}</span>`;
};

const renderChangedMetric = (value, changeDirection) => {
  const color =
    changeDirection === 'faster' ? '#10B981' : 
    changeDirection === 'slower' ? '#F43F5E' :
    'black';
  return `<p style="font-size:1.25em;"><span style="color:${color};">${value}%</span> ${changeDirection}</p>`;
} 

export default async (req, res) => {
  const { k } = req.query;
  if (k !== process.env.CRON_JOB_API_KEY) {
    return res.status(403).json({ message: 'Unauthorized.' })
  } else {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_GOD_MODE_KEY);

    // How do we decide what to toggle? 


    /*const { data, error } = await supabase
                                    .from('project_page_urls')
                                    .select(`full_url, projects:project_id (public_id)`)
                                    .eq('lab_test_cadence', cadence)
                                    .eq('lab_tests_enabled', true);
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Error fetching lab test configurations" });
    } else {
      console.log(`Enqueuing ${data.length} lab tests.`);
      console.log(data);
      await Promise.all(
        data.map(({ full_url, projects: { public_id } }) => WebPageTestRunner.runSpeedTest({ url: full_url, projectKey: public_id }))
      );
      return res.status(200).json({ success: true, message: `Enqueued ${data.length} lab tests.` });
    }*/

    WeeklyCWVReport.send({ to: "founders@swishjam.com", variables: {
      siteUrl: 'Swishjam.com',
      status: 'Passed',
      statusImg: 'https://swishjam.com/passed.png', 
      lcp: renderMetric('2.62s', 'Passed'),
      lcpChange: renderChangedMetric('+11', 'faster'),
      cls: renderMetric('0.23', 'Needs Improvement'),
      clsChange: renderChangedMetric('+1', 'slower'),
      inp: renderMetric('2.64s', 'Failing'),
      inpChange: renderChangedMetric('+2', 'slower'),
      fcp: renderMetric('2.65s', 'Passed'),
      fcpChange: renderChangedMetric('+5', 'faster'),
      ttfb: renderMetric('2.66s', 'Failing'), 
      ttfbChange: renderChangedMetric('+35', 'faster'), 
      fid: renderMetric('2.67s', 'Failing'),
      fidChange: renderChangedMetric('0', 'no change'), 
    }});
    return res.status(200).json({ success: true, message: `Completed` });
  }
}