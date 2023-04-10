import { InstrumentationHoster } from "@/lib/instrumentation-hoster";

export default async (req, res) => {
  const { projectKey } = req.body;
  const instrumentationHoster = new InstrumentationHoster({ projectKey });
  const instrumentationUrl = await instrumentationHoster.hostInstrumentation();
  return res.status(200).json({ url: instrumentationUrl });
}