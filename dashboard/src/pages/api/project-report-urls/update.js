import { Validator } from "@/lib/queryValidator";

export default async (req, res) => {
  const { organizationId, projectKey, id, url, dataType, cadence, enabled, notificationType, notificationDestination } = req.body;
  return await Validator.runQueryIfUserHasAccess({ req, res, projectKey, organizationId }, async ({ supabaseClient, currentProject }) => {
    const parsedUrl = new URL(url);
    const { data, error } = await supabaseClient.from('project_report_urls').update({
      url_uniqueness_key: `${currentProject.id}-${url}`,
      full_url: url,
      url_host: parsedUrl.host,
      url_path: parsedUrl.pathname,
      data_type: dataType,
      notification_type: notificationType,
      notification_destination: notificationDestination,
      cadence: cadence,
      enabled: enabled,
    }).match({ id }).select();
    if (error) {
      return res.status(400).json({ error: result.error.message });
    } else {
      return res.status(200).json({ success: true, record: data[0] });
    }
  });
}