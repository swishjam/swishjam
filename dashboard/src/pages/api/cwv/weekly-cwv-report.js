//import { WebPageTestRunner } from "@/lib/web-page-test/web-page-test-runner";
//import { createClient } from "@supabase/supabase-js";
//const VALID_CADENCES = ["5-minutes", "15-minutes", "30-minutes", "1-hour", "3-hours", "6-hours", "12-hours", "1-day"];
import { WeeklyCWVReport } from "@/lib/emails/weekly-cwv-report"

export default async (req, res) => {


  WeeklyCWVReport.send({ to: "founders@swishjam.com", variables: {
    siteUrl: 'swishjam.com',
    status: 'Passed',
    statusImg: 'https://swishjam.com/passed.png', 
    lcp: '<span style="color:green;font-size:1.5em;font-weight:bold;">2.61s</span>',
    lcpChange: '<p style="font-size:1.25em;"><span style="color:red;">+10%</span> slower than last week</p>',
    cls: '<span style="color:green;font-size:1.5em;font-weight:bold;">2.62s</span>',
    clsChange: '<p style="font-size:1.25em;"><span style="color:red;">+11%</span> slower than last week</p>',
    inp: '<span style="color:green;font-size:1.5em;font-weight:bold;">2.63s</span>',
    inpChange: '<p style="font-size:1.25em;"><span style="color:red;">+12%</span> slower than last week</p>',
    fcp: '<span style="color:green;font-size:1.5em;font-weight:bold;">2.64s</span>',
    fcpChange: '<p style="font-size:1.25em;"><span style="color:red;">+13%</span> slower than last week</p>',
    ttfb: '<span style="color:green;font-size:1.5em;font-weight:bold;">2.65s</span>',
    ttfbChange: '<p style="font-size:1.25em;"><span style="color:red;">+14%</span> slower than last week</p>',
    fid: '<span style="color:green;font-size:1.5em;font-weight:bold;">2.66s</span>',
    fidChange: '<p style="font-size:1.25em;"><span style="color:red;">+15%</span> slower than last week</p>',
  }});

  /*  const { cadence, k } = req.query;
  if (k !== process.env.CRON_JOB_API_KEY) {
    return res.status(403).json({ message: 'Unauthorized.' })
  } else if (!VALID_CADENCES.includes(cadence)) {
    return res.status(400).json({ error: "Invalid cadence" });
  } else {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_GOD_MODE_KEY);
    const { data, error } = await supabase
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
    }
  }*/
}