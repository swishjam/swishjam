import db from '@lib/db';

export class LargestContentfulPaintEntries {
  static async getPercentiles({ projectKey, urlHost, urlPath, startTs, percentile }) {
    const query = `
      SELECT
        lcp.url,
        COUNT(*) AS count,
        PERCENTILE_CONT(${parseFloat(percentile)}) WITHIN GROUP (ORDER BY lcp.start_time ASC) AS start_time,
        PERCENTILE_CONT(${parseFloat(percentile)}) WITHIN GROUP (ORDER BY lcp.render_time ASC) AS render_time,
        PERCENTILE_CONT(${parseFloat(percentile)}) WITHIN GROUP (ORDER BY lcp.load_time ASC) AS load_time,
        PERCENTILE_CONT(${parseFloat(percentile)}) WITHIN GROUP (ORDER BY lcp.size ASC) AS size
      FROM
        largest_contentful_paint_performance_entries AS lcp
      JOIN
        page_views AS pv ON lcp.page_view_uuid = pv.uuid
      WHERE
        pv.project_key = $1 AND
        pv.page_view_ts >= $2 AND
        pv.url_host = $3 AND
        pv.url_path = $4
      GROUP BY
        lcp.url
    `;
    return (await db.query(query, [projectKey, new Date(startTs), urlHost, urlPath])).rows;
  }

  static async getDistinctEntries({ projectKey, urlHost, urlPath, startTs }) {
    const query = `
      SELECT
        lcp.url,
        COUNT(*) AS count,
        AVG(lcp.start_time) AS average_start_time,
        AVG(lcp.render_time) AS average_render_time,
        AVG(lcp.load_time) AS average_load_time,
        AVG(lcp.size) AS average_size
      FROM
        largest_contentful_paint_performance_entries AS lcp
      JOIN
        page_views AS pv ON lcp.page_view_uuid = pv.uuid
      WHERE
        pv.project_key = $1 AND
        pv.page_view_ts >= $2 AND
        pv.url_host = $3 AND
        pv.url_path = $4
      GROUP BY
        lcp.url
    `;
    return (await db.query(query, [projectKey, new Date(startTs), urlHost, urlPath])).rows;
  }
}