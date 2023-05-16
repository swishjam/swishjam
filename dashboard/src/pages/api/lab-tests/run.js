import NextCors from 'nextjs-cors';
import { WebPageTestRunner } from '@/lib/web-page-test/web-page-test-runner';

export default async (req, res) => {
  await NextCors(req, res, { methods: ['GET'], origin: '*', optionsSuccessStatus: 200 });

  const {
    url,
    label,
    organizationId,
    projectKey,
    email,
    mobile = false,
    includeLighthouse = true,
    includeVideo = true,
    firstViewOnly = true,
    includeDevToolsTimeline = true,
    includeV8Profiler = true,
  } = req.query;

  let derivedUrl;
  let derivedLabel;
  try {
    const pattern = /^(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:\S+(?:\.[^\s.]+)+(?:\:\d{2,5})?)(?:\/[\w#!:.?+=&%@!-/])?$/;
    if (!pattern.test(url)) throw new Error('Invalid URL.');
    derivedUrl = url.startsWith('http') ? url : `https://${url}`;
    derivedLabel = label || `${new URL(derivedUrl).hostname} - ${new Date().toLocaleString()}}`
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Invalid URL provided: ${url}.` });
  }

  try {
    const { testId, jsonUrl } = await WebPageTestRunner.runSpeedTest({
      projectKey,
      url: derivedUrl,
      options: {
        label: derivedLabel,
        includeLighthouse,
        includeVideo,
        firstViewOnly,
        mobile,
        includeDevToolsTimeline,
        includeV8Profiler,
        // location: 'Dulles:Chrome.Cable',
      }
    });
    return res.status(200).json({ testId, jsonUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Unable to initiate speed test.' });
  }
}