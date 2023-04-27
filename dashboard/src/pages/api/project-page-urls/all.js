import { runQueryIfUserHasAccess } from "@/lib/analyticQuerier";

export default async (req, res) => {
  const { projectKey } = req.query;
  return await runQueryIfUserHasAccess({ req, res, projectKey }, async ({ supabaseClient, currentProject }) => {
    const labTestConfigurations = await supabaseClient.from('project_page_urls').select('*').eq('project_id', currentProject.id)
    return res.status(200).json(labTestConfigurations.data);
  });
}