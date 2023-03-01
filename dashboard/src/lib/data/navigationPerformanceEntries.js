import db from '@lib/db';

export default class NavigationPerformanceEntries {
  static async getAverageMetricGroupedByPage({ siteId, startTs, metric }) {
    const query = `
      SELECT
        page_views.url_path as name,
        AVG(${metric}) AS value
      FROM
        navigation_performance_entries
      JOIN
        page_views ON navigation_performance_entries.page_view_identifier = page_views.identifier
      WHERE
        page_views.site_id = $1 AND
        page_views.page_view_ts >= $2
      GROUP BY
        page_views.url_path
      ORDER BY
        value DESC
    `;
    const results = await db.query(query, [siteId, new Date(startTs)]);
    return results.rows;
  }
}