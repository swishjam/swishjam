import db from '@lib/db';

export default class ResourcePerformanceEntries {
  static async getAll({ 
    projectKey, 
    urlHostAndPath,
    startTs, 
    metric = 'duration',
    limit = 50,
    initiatorTypes = ['script', 'xmlhttprequest', 'img', 'link', 'fetch', 'css', 'other'] 
  }) {
    const query = `
      SELECT
        resource_performance_entries.name AS name,
        resource_performance_entries.initiator_type,
        COUNT(resource_performance_entries.name) AS count,
        AVG(${metric}) AS value
      FROM
        resource_performance_entries
      JOIN
        page_views ON resource_performance_entries.page_view_identifier = page_views.identifier
      WHERE
        page_views.project_key = $1 AND
        CONCAT(page_views.url_host, page_views.url_path) = $2 AND
        page_views.page_view_ts >= $3 AND
        resource_performance_entries.initiator_type IN (${initiatorTypes.map((_, i) => `$${i + 4}`).join(', ')})
      GROUP BY
        resource_performance_entries.name,
        resource_performance_entries.initiator_type
      ORDER BY
        value DESC
      LIMIT ${limit}
    `;
    return (await db.query(query, [projectKey, decodeURIComponent(urlHostAndPath), new Date(startTs), ...initiatorTypes])).rows;
    // return (await db.query(query, [projectKey, decodeURIComponent(urlHostAndPath), new Date(startTs)])).rows;
  }

  static async getTimeseriesForMetric({ projectKey, resourceName, metric, startTs }) {
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
        page_views.project_key = $1 AND
        resource_performance_entries.name = $2 AND
        page_views.page_view_ts >= $3 AND
        resource_performance_entries.${metric} IS NOT NULL AND
        resource_performance_entries.${metric} > 0
      GROUP BY
        day, hour, name
      ORDER BY
        day, hour ASC
    `;
    return (await db.query(query, [projectKey, decodeURIComponent(resourceName), new Date(startTs)])).rows;
  }
}