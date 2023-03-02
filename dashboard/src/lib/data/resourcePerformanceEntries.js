import db from '@lib/db';

export default class NavigationPerformanceEntries {
  static async getForUrlPath({ 
    siteId, 
    urlPath, 
    startTs, 
    limit = 50,
    initiatorTypes = ['script', 'xmlhttprequest', 'img', 'link', 'fetch', 'css', 'other'] 
  }) {
    const query = `
      SELECT
        resource_performance_entries.name AS name,
        COUNT(resource_performance_entries.name) AS count,
        resource_performance_entries.initiator_type,
        AVG(duration) AS value
      FROM
        resource_performance_entries
      JOIN
        page_views ON resource_performance_entries.page_view_identifier = page_views.identifier
      WHERE
        page_views.site_id = $1 AND
        page_views.url_path = $2 AND
        page_views.page_view_ts >= $3
      GROUP BY
        resource_performance_entries.name,
        resource_performance_entries.initiator_type
      ORDER BY
        value DESC
      LIMIT ${limit}
    `;
    return (await db.query(query, [siteId, urlPath, new Date(startTs)])).rows;
  }

  static async getTimeseriesForMetric({ siteId, resourceName, metric, startTs }) {
    const query = `
      SELECT
        resource_performance_entries.name AS name,
        AVG(${metric}) AS metric,
        date_trunc('hour', page_views.page_view_ts) AS hour,
        date_trunc('day', page_views.page_view_ts) AS day
      FROM
        resource_performance_entries
      JOIN
        page_views ON resource_performance_entries.page_view_identifier = page_views.identifier
      WHERE
        page_views.site_id = $1 AND
        resource_performance_entries.name = $2 AND
        page_views.page_view_ts >= $3 AND
        resource_performance_entries.${metric} IS NOT NULL AND
        resource_performance_entries.${metric} > 0
      GROUP BY
        day, hour, name
      ORDER BY
        day, hour ASC
    `;
    return (await db.query(query, [siteId, decodeURIComponent(resourceName), new Date(startTs)])).rows;
  }
}