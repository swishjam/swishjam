const WEB_PAGE_TEST_API_KEY = 'c78a8060-6069-4df3-8b70-a3103287acbf';

export default async (req, res) => {
  const { 
    url, 
    includeLighthouse = true, 
    includeVideo = true,
    label,
  } = req.query;
  let derivedUrl;
  let derivedLabel;
  try {
    derivedUrl = url.startsWith('http') ? url : `https://${url}`;
    derivedLabel = label || `${new URL(derivedUrl).hostname} - ${new Date().toLocaleString()}}`
  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: `Invalid URL provided: ${url}.` });
  }
  const queryParams = new URLSearchParams({ 
    url: derivedUrl, 
    k: WEB_PAGE_TEST_API_KEY, 
    lighthouse: includeLighthouse ? 1 : 0, 
    video: includeVideo ? 1 : 0, 
    label: derivedLabel, 
    f: 'json' 
  });
  const wptUrl = `https://www.webpagetest.org/runtest.php?${queryParams}`;
  const result = await fetch(wptUrl, { method: 'POST' });
  if (result.status === 200) {
    const { data: { testId, jsonUrl }} = await result.json();
    res.status(200).json({ testId, jsonUrl });
  } else {
    console.error('Unable to initiate speed test');
    console.error(result);
    res.status(500).json({ error: 'Unable to initiate speed test' });
  }
}