import { runQueryIfUserHasAccess } from "@/lib/analyticQuerier";
import { LabTests } from "@/lib/data/labTests";

export default async (req, res) => {
  const { projectKey } = req.query;
  return await runQueryIfUserHasAccess({ req, res, projectKey }, async () => {
    // HACK! change this back. Hardcoding for testing purposes
    const rows = await LabTests.getUniqueHosts({ projectKey: 'ANONYMOUS' });
    const hostArray = rows.map(({ url_host }) => url_host);
    res.status(200).json(hostArray);
  });
}