import { WebPageTestRunner } from "@/lib/web-page-test-runner";
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const VALID_CADENCES = ["5-minutes", "15-minutes", "30-minutes", "1-hour", "3-hours", "6-hours", "12-hours", "1-day"];

export default async (req, res) => {
  const { cadence, k } = req.query;
  if (k !== process.env.CRON_JOB_API_KEY) {
    return res.status(403).json({ message: 'Unauthorized.' })
  } else if (!VALID_CADENCES.includes(cadence)) {
    return res.status(400).json({ error: "Invalid cadence" });
  } else {
    const supabase = createServerSupabaseClient({ req, res });
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
  }
}