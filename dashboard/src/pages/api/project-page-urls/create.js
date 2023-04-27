import { runQueryIfUserHasAccess } from "@/lib/analyticQuerier";

export default async (req, res) => {
  const { projectKey, labTestCadence, labTestsEnabled } = req.body;
  let { url } = req.body;
  if (!['1-minute', '5-minutes', '15-minutes', '30-minutes', '1-hour', '3-hours', '6-hours', '12-hours', '1-day'].includes(labTestCadence)) {
    return res.status(400).json({ error: 'Invalid cadence.' });
  }
  return await runQueryIfUserHasAccess({ req, res, projectKey }, async ({ supabaseClient, currentProject }) => {
    if (!url.startsWith('http')) url = `https://${url}`;

    const existingPageUrl = await supabaseClient.from('project_page_urls').select().eq('full_url', url);
    console.log(existingPageUrl)
    if (existingPageUrl.data.length > 0) return res.status(400).json({ error: `${url} page URL already exists.` });

    const parsedUrl = new URL(url);
    const { data, error } = await supabaseClient.from('project_page_urls').insert({ 
      project_id: currentProject.id,
      full_url: url, 
      url_host: parsedUrl.host,
      url_path: parsedUrl.pathname,
      lab_test_cadence: labTestCadence,
      lab_tests_enabled: labTestsEnabled,
    }).select();
    if (error) {
      return res.status(500).json({ error: result.error.message });
    } else {
      return res.status(200).json({ success: true, record: data[0] });
    }
  });
}