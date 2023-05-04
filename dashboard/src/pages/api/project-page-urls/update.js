import { runQueryIfUserHasAccess } from "@/lib/analyticQuerier";

export default async (req, res) => {
  const { projectKey, id, url, labTestCadence, labTestsEnabled } = req.body;
  return await runQueryIfUserHasAccess({ req, res, projectKey }, async ({ supabaseClient }) => {
    const parsedUrl = new URL(url);
    const { data, error } = await supabaseClient.from('project_page_urls').update({
      full_url: url,
      url_host: parsedUrl.host,
      url_path: parsedUrl.pathname,
      lab_test_cadence: labTestCadence,
      lab_tests_enabled: labTestsEnabled,
    }).match({ id }).select();
    if (error) {
      return res.status(400).json({ error: result.error.message });
    } else {
      return res.status(200).json({ success: true, record: data[0] });
    }
  });
}