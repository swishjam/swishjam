import { Validator } from "@/lib/queryValidator";

export default async (req, res) => {
  const { projectKey, organizationId } = req.query;
  return await Validator.runQueryIfUserHasAccess({ req, res, projectKey, organizationId }, async ({ supabaseClient, currentProject }) => {
    const labTestConfigurations = await supabaseClient.from('project_page_urls').select('*').eq('project_id', currentProject.id)
    return res.status(200).json(labTestConfigurations.data);
  });
}