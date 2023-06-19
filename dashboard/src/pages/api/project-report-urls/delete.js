import { Validator } from "@/lib/queryValidator";

export default async (req, res) => {
  const { organizationId, projectKey, id } = req.body;
  return await Validator.runQueryIfUserHasAccess({ req, res, projectKey, organizationId }, async ({ supabaseClient }) => {
    const result = await supabaseClient.from('project_report_urls').delete().match({ id }).select();
    if (result.error) {
      return res.status(500).json({ error: result.error.message });
    } else {
      return res.status(200).json({ success: true, record: result.data[0] });
    }
  });
}