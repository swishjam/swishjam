import db from '@lib/db'
import { CONNECTIONS } from './connections';
import { NAMES_TO_CODE } from './locations';

const booleanToInteger = (bool, defaultVal) => typeof bool === 'boolean' 
                                                  ? bool 
                                                    ? 1 
                                                    : 0 
                                                  : defaultVal 
                                                    ? 1 
                                                    : 0;

export class WebPageTestRunner {
  static async runSpeedTest({ projectKey, url, options = {} }) {
    if (!url) throw new Error('No URL provided.');
    const params = new URLSearchParams({
      url,
      k: process.env.WEB_PAGE_TEST_API_KEY,
      label: options.label,
      location: options.location || `${NAMES_TO_CODE.NEW_YORK_CITY}:Chrome.${CONNECTIONS.Cable}`,
      lighthouse: 1,
      video: 1,
      fvonly: 1,
      mobile: 0,
      timeline: 1,
      profiler: 1,
      wappalyzer: 0,
      pngss: 1, // full res screenshot of the fully loaded page
      iq: 100, // Specify a JPEG compression level (between 30-100) for the screenshots and video capture.
      axe: 0,
      metadata: JSON.stringify({ projectKey }),
      // lighthouse: booleanToInteger(options.includeLighthouse, true),
      // video: booleanToInteger(options.includeVideo, true),
      // fvonly: booleanToInteger(options.firstViewOnly, true),
      // mobile: booleanToInteger(options.mobile, false),
      // timeline: booleanToInteger(options.includeDevToolsTimeline, true),
      // profiler: booleanToInteger(options.includeV8Profiler, true),
      appendua: 'SwishjamLabTests',
      pingback: `https://${process.env.WEB_PAGE_TEST_WEBHOOK_HOST || 'app.swishjam.com'}/api/lab-tests/webhook`,
      f: 'json'
    });
    console.log('PINGBACK IS: ', process.env.WEB_PAGE_TEST_WEBHOOK_HOST);
    const result = await fetch(`https://www.webpagetest.org/runtest.php?${params}`, { method: 'POST' });
    if (result.status === 200) {
      const response = await result.json();
      const { data: { testId, jsonUrl }} = response;
      const payload = {
        uuid: testId,
        project_key: projectKey || 'undefined',
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