import { Validator } from "@/lib/queryValidator";

export default async (req, res) => {
  const { organizationId, projectKey, labTestCadence, labTestsEnabled } = req.body;
  let { url } = req.body;
  if (![undefined, '5-minutes', '15-minutes', '30-minutes', '1-hour', '3-hours', '6-hours', '12-hours', '1-day'].includes(labTestCadence)) {
    return res.status(400).json({ error: 'Invalid cadence.' });
  }
  return await Validator.runQueryIfUserHasAccess({ req, res, projectKey, organizationId }, async ({ supabaseClient, currentProject }) => {
    if (!url.startsWith('http')) url = `https://${url}`;

    const parsedUrl = new URL(url);
    const { data, error } = await supabaseClient.from('project_page_urls').insert({ 
      project_id: currentProject.id,
      url_uniqueness_key: `${currentProject.id}-${url}`,
      full_url: url, 
      url_host: parsedUrl.host,
      url_path: parsedUrl.pathname,
      lab_test_cadence: labTestCadence,
      lab_tests_enabled: labTestsEnabled,
    }).select();
    if (error) {
      if (error.message.includes('duplicate key value violates unique constraint')) {
        return res.status(400).json({ error: `A URL for "${url}" already exists for this project.` });
      } else {
        return res.status(500).json({ error: 'An error occurred, cannot add new configuration.' });
      }
    } else {
      return res.status(200).json({ success: true, record: data[0] });
    }
  });
}