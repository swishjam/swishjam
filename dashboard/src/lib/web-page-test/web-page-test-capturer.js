import db from '@lib/db';

const numberOrNegativeOne = (num, parser = parseInt) => typeof num === 'undefined' ? -1 : parser(num);

export default class WebPageTestCapturer {
  static capture = async testId => {
    try {
      const testResults = await (await fetch(`https://www.webpagetest.org/jsonResult.php?test=${testId}&breakdown=${1}`)).json();

      if (testResults.statusCode === 200) {
        const { data } = testResults || {};
        const payload = WebPageTestCapturer._formatPayload(data);
        return WebPageTestCapturer._writeToDb(testId, payload);
      } else {
        console.error('Unable to capture synthetic result.');
        console.error(testResults);
        return Promise.resolve({ id: testId, success: false, error: `Unable to capture lab test with a ${testResults.statusCode} status code.` })
      }
    } catch (err) {
      console.error('Cannot capture lab test result.')
      console.error(err)
      return Promise.resolve({ id: testId, success: false, error: err.message })
    }
  }

  static _formatPayload = data => ({
    full_url: data.url || '',
    url_host: data.url ? new URL(data.url).host : '',
    url_path: data.url ? new URL(data.url).pathname : '',
    url_query: data.url ? new URL(data.url).search : '',
    browser_name: data.median?.firstView?.browser_name,
    browser_version: data.median?.firstView?.browser_version,
    user_agent: '',
    location: data.location,
    connectivity: data.connectivity,
    bandwidth_down: numberOrNegativeOne(data.bwDown),
    bandwidth_up: numberOrNegativeOne(data.bwUp),
    is_mobile: new Boolean(data.mobile),
    bytes_out: numberOrNegativeOne(data.median?.firstView?.bytesOut),
    bytes_out_doc: numberOrNegativeOne(data.median?.firstView?.bytesOutDoc),
    bytes_in: numberOrNegativeOne(data.median?.firstView?.bytesIn),
    bytes_in_doc: numberOrNegativeOne(data.median?.firstView?.bytesInDoc),
    load_event_start: numberOrNegativeOne(data.median?.firstView?.loadEventStart),
    load_event_end: numberOrNegativeOne(data.median?.firstView?.loadEventEnd),
    dom_content_loaded_event_start: numberOrNegativeOne(data.median?.firstView?.domContentLoadedEventStart),
    dom_content_loaded_event_end: numberOrNegativeOne(data.median?.firstView?.domContentLoadedEventEnd),
    dom_interactive: numberOrNegativeOne(data.median?.firstView?.domInteractive),
    first_paint: numberOrNegativeOne(data.median?.firstView?.firstPaint),
    first_contentful_paint: numberOrNegativeOne(data.median?.firstView?.firstContentfulPaint),
    first_meaningful_paint: numberOrNegativeOne(data.median?.firstView?.firstMeaningfulPaint),
    largest_contentful_paint: numberOrNegativeOne(data.median?.firstView?.['chromeUserTiming.LargestContentfulPaint']),
    time_to_first_byte: numberOrNegativeOne(data.median?.firstView?.TTFB),
    dom_complete: numberOrNegativeOne(data.median?.firstView?.domComplete),
    total_blocking_time: numberOrNegativeOne(data.median?.firstView?.TotalBlockingTime),
    cumulative_layout_shift: numberOrNegativeOne(data.median?.firstView?.['chromeUserTiming.CumulativeLayoutShift'], parseFloat),
    max_first_input_delay: numberOrNegativeOne(data.median?.firstView?.maxFID),
    speed_index: numberOrNegativeOne(data.median?.firstView?.SpeedIndex),
    visual_complete_85: numberOrNegativeOne(data.median?.firstView?.visualComplete85),
    num_dom_elements: numberOrNegativeOne(data.median?.firstView?.domElements),
    lighthouse_performance_score: numberOrNegativeOne(data?.lighthouse?.categories?.performance?.score, parseFloat),
    html_bytes: numberOrNegativeOne(data.median?.firstView?.breakdown?.html?.bytes),
    javascript_bytes: numberOrNegativeOne(data.median?.firstView?.breakdown?.js?.bytes),
    css_bytes: numberOrNegativeOne(data.median?.firstView?.breakdown?.css?.bytes),
    image_bytes: numberOrNegativeOne(data.median?.firstView?.breakdown?.image?.bytes),
    font_bytes: numberOrNegativeOne(data.median?.firstView?.breakdown?.font?.bytes),
    video_bytes: numberOrNegativeOne(data.median?.firstView?.breakdown?.video?.bytes),
    other_bytes: numberOrNegativeOne(data.median?.firstView?.breakdown?.other?.bytes)
  })

  static _writeToDb = async (testId, payload) => {
    return new Promise(resolve => {
      db.query(WebPageTestCapturer._generateSqlQuery(testId, payload), (err, result) => {
        if (err) {
          console.error('Cannot capture lab test result.')
          console.error(err.stack);
          resolve({ id: testId, success: false, error: err.message, payload })
        } else {
          if (result.rowCount === 0) {
            console.error(`Cannot find record for lab test ${testId}`);
            resolve({ id: testId, success: false, error: err.message, payload })
          } else {
            console.log(`Successfully captured lab test result for ${testId}.`);
            resolve({ id: testId, success: true, payload })
          }
        }
      });
    })
  }

  static _generateSqlQuery = (testId, payload) => (
    `
      UPDATE synthetic_runs 
      SET
        full_url = '${payload.full_url}',
        url_host = '${payload.url_host}',
        url_path = '${payload.url_path}',
        url_query = '${payload.url_query}',
        browser_name = '${payload.browser_name}',
        browser_version = '${payload.browser_version}',
        user_agent = '${payload.user_agent}',
        location = '${payload.location}',
        connectivity = '${payload.connectivity}',
        bandwidth_down = ${payload.bandwidth_down},
        bandwidth_up = ${payload.bandwidth_up},
        is_mobile = ${payload.is_mobile},
        bytes_out = ${payload.bytes_out},
        bytes_out_doc = ${payload.bytes_out_doc},
        bytes_in = ${payload.bytes_in},
        bytes_in_doc = ${payload.bytes_in_doc},
        load_event_start = ${payload.load_event_start},
        load_event_end = ${payload.load_event_end},
        dom_content_loaded_event_start = ${payload.dom_content_loaded_event_start},
        dom_content_loaded_event_end = ${payload.dom_content_loaded_event_end},
        dom_interactive = ${payload.dom_interactive},
        first_paint = ${payload.first_paint},
        first_contentful_paint = ${payload.first_contentful_paint},
        first_meaningful_paint = ${payload.first_meaningful_paint},
        largest_contentful_paint = ${payload.largest_contentful_paint},
        time_to_first_byte = ${payload.time_to_first_byte},
        dom_complete = ${payload.dom_complete},
        total_blocking_time = ${payload.total_blocking_time},
        cumulative_layout_shift = ${payload.cumulative_layout_shift},
        max_first_input_delay = ${payload.max_first_input_delay},
        speed_index = ${payload.speed_index},
        visual_complete_85 = ${payload.visual_complete_85},
        num_dom_elements = ${payload.num_dom_elements},
        lighthouse_performance_score = ${payload.lighthouse_performance_score},
        html_bytes = ${payload.html_bytes},
        javascript_bytes = ${payload.javascript_bytes},
        css_bytes = ${payload.css_bytes},
        image_bytes = ${payload.image_bytes},
        font_bytes = ${payload.font_bytes},
        video_bytes = ${payload.video_bytes},
        other_bytes = ${payload.other_bytes},
        completed_at = CURRENT_TIMESTAMP
      WHERE uuid = '${testId}'
    `
  )
}