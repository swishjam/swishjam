import { Validator } from "@/lib/queryValidator";
import { ProjectReportUrl } from "@/models/ProjectReportUrl";

export default async (req, res) => {
  const { organizationId, projectKey, dataType, cadence, enabled, notificationType, notificationDestination } = req.body;
  let { url } = req.body;
  if (![undefined, '7-day', '14-day'].includes(cadence)) {
    return res.status(400).json({ error: 'Invalid cadence.' });
  }
  return await Validator.runQueryIfUserHasAccess({ req, res, projectKey, organizationId }, async ({ currentProject }) => {
    if (!url.startsWith('http')) url = `https://${url}`;

    const { record, error } = await ProjectReportUrl.create({ 
      url, 
      dataType, 
      cadence, 
      enabled, 
      notificationType,
      notificationDestination,
      projectId: currentProject.id, 
    });

    if (error) {
      if (error.message.includes('duplicate key value violates unique constraint')) {
        return res.status(400).json({ error: `A URL for "${url}" already exists for this project.` });
      } else {
        return res.status(500).json({ error: 'An error occurred, cannot add new configuration.' });
      }
    } else {
      return res.status(200).json({ success: true, record });
    }
  });
}