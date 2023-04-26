import { runQueryIfUserHasAccess } from "@/lib/analyticQuerier";

export default async (req, res) => {
  const { projectKey, cadence } = req.body;
  let { url } = req.body;
  if (!['1-minute', '5-minutes', '15-minutes', '30-minutes', '1-hour', '3-hours', '6-hours', '12-hours', '1-day'].includes(cadence)) {
    return res.status(400).json({ error: 'Invalid cadence.' });
  }
  if (!url.startsWith('http')) url = `https://${url}`;
  return await runQueryIfUserHasAccess({ req, res, projectKey }, async ({ supabaseClient, currentProject }) => {
    const result = await supabaseClient.from('lab_test_configurations').insert({ url, cadence, project_id: currentProject.id }).select();
    if (result.error) {
      return res.status(500).json({ error: result.error.message });
    } else {
      return res.status(200).json({ success: true, record: result.data[0] });
    }
  });
}