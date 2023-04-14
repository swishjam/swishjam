import NextCors from 'nextjs-cors';

export default async (req, res) => {
  await NextCors(req, res, {
    methods: ['GET'],
    origin: '*',
    optionsSuccessStatus: 200,
  });

  const { url, includeLighthouse = true, includeVideo = true, label } = req.query;
  let derivedUrl;
  let derivedLabel;
  try {
    if (!url || url.indexOf('.') === -1) throw new Error('Invalid URL.');
    derivedUrl = url.startsWith('http') ? url : `https://${url}`;
    derivedLabel = label || `${new URL(derivedUrl).hostname} - ${new Date().toLocaleString()}}`
  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: `Invalid URL provided: ${url}.` });
  }
  const queryParams = new URLSearchParams({ 
    url: derivedUrl, 
    k: process.env.WEB_PAGE_TEST_API_KEY, 
    lighthouse: includeLighthouse ? 1 : 0, 
    video: includeVideo ? 1 : 0, 
    label: derivedLabel, 
    f: 'json' 
  });
  const result = await fetch(`https://www.webpagetest.org/runtest.php?${queryParams}`, { method: 'POST' });
  if (result.status === 200) {
    const response = await result.json();
    if (response.data.testId) {
      const { data: { testId, jsonUrl }} = response;
      res.status(200).json({ testId, jsonUrl });
    } else {
      res.status(500).json({ error: 'Unable to initiate speed test.' });
    }
  } else {
    console.error('Unable to initiate speed test');
    console.error(result);
    res.status(500).json({ error: 'Unable to initiate speed test.' });
  }
}