import { Validator } from "@/lib/queryValidator";

export default async (req, res) => {
  const { projectKey, organizationId } = req.query;
  return await Validator.runQueryIfUserHasAccess({ req, res, projectKey, organizationId }, async ({ supabaseClient, currentProject }) => {
    const reportConfigurations = await supabaseClient.from('project_report_urls').select('*').eq('project_id', currentProject.id)
    return res.status(200).json(reportConfigurations.data);
  });
}