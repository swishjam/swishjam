import db from '@lib/db'

const booleanToInteger = (bool, defaultVal) => typeof bool === 'boolean' 
                                                  ? bool 
                                                    ? 1 
                                                    : 0 
                                                  : defaultVal 
                                                    ? 1 
                                                    : 0;

export class WebPageTestRunner {
  static async runSpeedTest({
    projectKey,
    url,
    options = {}
  }) {
    if (!url) throw new Error('No URL provided.');
    const params = new URLSearchParams({
      url,
      k: process.env.WEB_PAGE_TEST_API_KEY,
      label: options.label,
      lighthouse: booleanToInteger(options.includeLighthouse, true),
      video: booleanToInteger(options.includeVideo, true),
      fvonly: booleanToInteger(options.firstViewOnly, true),
      mobile: booleanToInteger(options.mobile, false),
      timeline: booleanToInteger(options.includeDevToolsTimeline, true),
      profiler: booleanToInteger(options.includeV8Profiler, true),
      pingback: `https://${process.env.WEB_PAGE_TEST_WEBHOOK_HOST || 'app.swishjam.com'}/api/speed-tests/webhook`,
      f: 'json'
    });
    const result = await fetch(`https://www.webpagetest.org/runtest.php?${params}`, { method: 'POST' });
    if (result.status === 200) {
      const response = await result.json();
      const { data: { testId, jsonUrl } } = response;
      const payload = {
        uuid: testId,
        project_key: projectKey || 'ANONYMOUS',
        full_url: url,
        url_host: new URL(url).host,
        url_path: new URL(url).pathname,
        url_query: new URL(url).search,
      }
      const insertData = Object.values(payload);
      const query = {
        text: `
        INSERT INTO synthetic_runs (
          uuid,
          project_key,
          full_url,
          url_host,
          url_path,
          url_query
        ) VALUES(${insertData.map((_val, i) => `$${i + 1}`).join(', ')})
      `,
        values: insertData,
      }
      await db.query(query, (err, _result) => {
        if (err) {
          console.error('Unable to initiate speed test');
          console.error(err)
          throw new Error('Unable to initiate speed test.');
        }
      });
      return { testId, jsonUrl };
    } else {
      console.error('Unable to initiate speed test');
      console.error(result);
      throw new Error('Unable to initiate speed test.');
    }
  }
}