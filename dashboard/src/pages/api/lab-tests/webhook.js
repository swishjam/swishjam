import db from '@lib/db';
import { WebPageTestResults } from '@/lib/web-page-test-results-parser';

export default async (req, res) => {
  const start = Date.now();
  const { id } = req.query;

  const testResults = await (await fetch(`https://www.webpagetest.org/jsonResult.php?test=${id}&breakdown=${1}`)).json();

  if (testResults.statusCode === 200) {
    const { data } = testResults;
    
    // let lcpImgURL;
    // let lcpImageDiscoveredAt;
    // let lcpImageDownloadedAt;
    // try {
    //   const webPageTestResults = new WebPageTestResults(testResults);
    //   const requestData = webPageTestResults.requestData();
    //   lcpImgURL = webPageTestResults.lcpImg();
    //   const lcpImageURLRequest = requestData.find(req => req.url() === lcpImgURL);
    //   lcpImageDiscoveredAt = lcpImageURLRequest && lcpImageURLRequest.firstTimestamp();
    //   lcpImageDownloadedAt = lcpImageURLRequest && lcpImageURLRequest.downloadEnd();
    // } catch(err) {}

    const payload = {
      full_url: data.url,
      url_host: new URL(data.url).host,
      url_path: new URL(data.url).pathname,
      url_query: new URL(data.url).search,
      browser_name: data.median.firstView.browser_name,
      browser_version: data.median.firstView.browser_version,
      user_agent: '',
      location: data.location,
      connectivity: data.connectivity,
      bandwidth_down: data.bwDown,
      bandwidth_up: data.bwUp,
      is_mobile: data.mobile,
      bytes_out: data.median.firstView.bytesOut,
      bytes_out_doc: data.median.firstView.bytesOutDoc,
      bytes_in: data.median.firstView.bytesIn,
      bytes_in_doc: data.median.firstView.bytesInDoc,
      load_event_start: data.median.firstView.loadEventStart,
      load_event_end: data.median.firstView.loadEventEnd,
      dom_content_loaded_event_start: data.median.firstView.domContentLoadedEventStart,
      dom_content_loaded_event_end: data.median.firstView.domContentLoadedEventEnd,
      dom_interactive: data.median.firstView.domInteractive,
      first_paint: parseInt(data.median.firstView.firstPaint),
      first_contentful_paint: data.median.firstView.firstContentfulPaint,
      first_meaningful_paint: data.median.firstView.firstMeaningfulPaint,
      largest_contentful_paint: data.median.firstView['chromeUserTiming.LargestContentfulPaint'],
      time_to_first_byte: data.median.firstView.TTFB,
      dom_complete: data.median.firstView.domComplete,
      total_blocking_time: data.median.firstView.TotalBlockingTime,
      cumulative_layout_shift: data.median.firstView['chromeUserTiming.CumulativeLayoutShift'],
      max_first_input_delay: data.median.firstView.maxFID,
      speed_index: data.median.firstView.SpeedIndex,
      visual_complete_85: data.median.firstView.visualComplete85,
      num_dom_elements: data.median.firstView.domElements,
      lighthouse_performance_score: data.lighthouse.categories.performance.score,
      html_bytes: data.median.firstView.breakdown.html.bytes,
      javascript_bytes: data.median.firstView.breakdown.js.bytes,
      css_bytes: data.median.firstView.breakdown.css.bytes,
      image_bytes: data.median.firstView.breakdown.image.bytes,
      font_bytes: data.median.firstView.breakdown.font.bytes,
      video_bytes: data.median.firstView.breakdown.video.bytes,
      other_bytes: data.median.firstView.breakdown.other.bytes,
      completed_at: new Date(),
    }
    const query = `
      UPDATE synthetic_runs 
      SET
        full_url = $1,
        url_host = $2,
        url_path = $3,
        url_query = $4,
        browser_name = $5,
        browser_version = $6,
        user_agent = $7,
        location = $8,
        connectivity = $9,
        bandwidth_down = $10,
        bandwidth_up = $11,
        is_mobile = $12,
        bytes_out = $13,
        bytes_out_doc = $14,
        bytes_in = $15,
        bytes_in_doc = $16,
        load_event_start = $17,
        load_event_end = $18,
        dom_content_loaded_event_start = $19,
        dom_content_loaded_event_end = $20,
        dom_interactive = $21,
        first_paint = $22,
        first_contentful_paint = $23,
        first_meaningful_paint = $24,
        largest_contentful_paint = $25,
        time_to_first_byte = $26,
        dom_complete = $27,
        total_blocking_time = $28,
        cumulative_layout_shift = $29,
        max_first_input_delay = $30,
        speed_index = $31,
        visual_complete_85 = $32,
        num_dom_elements = $33,
        lighthouse_performance_score = $34,
        html_bytes = $35,
        javascript_bytes = $36,
        css_bytes = $37,
        image_bytes = $38,
        font_bytes = $39,
        video_bytes = $40,
        other_bytes = $41,
        completed_at = $42
      WHERE uuid = '${id}'
    `
    return await db.query(query, Object.values(payload), (err, _result) => {
      if (err) {
        console.error('Cannot capture lab test result.')
        console.error(err.stack);
        return res.status(500).json({ error: 'Unable to capture lab test result.' });
      } else {
        if(_result.rowCount === 0) {
          console.error(`Cannot find record for synthetic result ${id}`);
          return res.status(500).json({ error: 'Unable to capture lab test result.' });
        } else {
          console.log(`Successfully captured lab test result for ${id}.`);
          return res.status(200).json({ message: `Updated lab test ${id} in ${(Date.now() - start) / 1_000} seconds.` });
        }
      }
    });
  } else {
    console.error('Unable to capture synthetic result.');
    console.error(testResults);
    return res.status(500).json({ error: 'Unable to capture synthetic result.' });
  }
}