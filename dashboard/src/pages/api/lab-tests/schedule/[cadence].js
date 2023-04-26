import { WebPageTestRunner } from "@/lib/web-page-test-runner";

const VALID_CADENCES = [
  "5-minutes",
  "15-minutes",
  "30-minutes",
  "1-hour",
  "3-hours",
  "6-hours",
  "12-hours",
  "daily",
]

export default async (req, res) => {
  const { cadence } = req.query;
  if (!VALID_CADENCES.includes(cadence)) {
    return res.status(400).json({ error: "Invalid cadence" });
  }
  const url = 'https://swishjam.com';
  const projectKey = '25962e0d-3af4-4e05-96d2-fdc6af7c558e';
  await WebPageTestRunner.runSpeedTest({ projectKey, url });
}