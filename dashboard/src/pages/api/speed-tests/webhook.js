import db from '@lib/db';

export default async (req, res) => {
  const { id } = req.query;

  const testResults = await (await fetch(`https://www.webpagetest.org/jsonResult.php?test=${id}&breakdown=${1}`)).json();

  if (testResults.statusCode === 200) {
    const { data } = testResults;
    // const userEmail = (data.median.firstView.metadata || {}).email;
    const payload = {
      uuid: id,
      project_key: (data.median.firstView.metadata || {}).projectKey || 'ANONYMOUS',
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
    console.log(payload);
    const insertData = Object.values(payload);
    const query = {
      text: `
        INSERT INTO synthetic_runs (
          uuid,
          project_key,
          full_url,
          url_host,
          url_path,
          url_query,
          browser_name,
          browser_version,
          user_agent,
          location,
          connectivity,
          bandwidth_down,
          bandwidth_up,
          is_mobile,
          bytes_out,
          bytes_out_doc,
          bytes_in,
          bytes_in_doc,
          load_event_start,
          load_event_end,
          dom_content_loaded_event_start,
          dom_content_loaded_event_end,
          dom_interactive,
          first_paint,
          first_contentful_paint,
          first_meaningful_paint,
          largest_contentful_paint,
          time_to_first_byte,
          dom_complete,
          total_blocking_time,
          cumulative_layout_shift,
          max_first_input_delay,
          speed_index,
          visual_complete_85,
          num_dom_elements,
          lighthouse_performance_score,
          html_bytes,
          javascript_bytes,
          css_bytes,
          image_bytes,
          font_bytes,
          video_bytes,
          other_bytes,
          completed_at
        ) VALUES(${insertData.map((_val, i) => `$${i + 1}`).join(', ')})
      `,
      values: insertData,
    }
    return await db.query(query, (err, _result) => {
      if (err) {
        console.error(err.stack);
        return res.status(500).json({ error: 'Unable to capture synthetic result.' });
      } else {
        return res.status(200).json({ message: 'Captured.' });
      }
    });
  } else {
    console.error('Unable to capture synthetic result.');
    console.error(testResults);
    return res.status(500).json({ error: 'Unable to capture synthetic result.' });
  }
}