import db from '@lib/db';

export default class ResourcePerformanceEntries {
  static async getAll({ 
    projectKey, 
    urlPath,
    urlHost,
    startTs, 
    limit = 150,
    minimumOccurrences = 10,
  }) {
    const query = `
      SELECT
        CONCAT(resource_performance_entries.name_to_url_host, resource_performance_entries.name_to_url_path) AS name,
        resource_performance_entries.initiator_type,
        resource_performance_entries.render_blocking_status,
        COUNT(resource_performance_entries.name) AS count,
        AVG(resource_performance_entries.start_time) AS average_start_time,
        AVG(resource_performance_entries.domain_lookup_start) AS average_domain_lookup_start,
        AVG(resource_performance_entries.domain_lookup_end) AS average_domain_lookup_end,
        AVG(resource_performance_entries.connect_start) AS average_connect_start,
        AVG(resource_performance_entries.connect_end) AS average_connect_end,
        AVG(resource_performance_entries.secure_connection_start) AS average_secure_connection_start,
        AVG(resource_performance_entries.request_start) AS average_request_start,
        AVG(resource_performance_entries.response_start) AS average_response_start,
        AVG(resource_performance_entries.response_end) AS average_response_end,
        AVG(resource_performance_entries.duration) AS average_duration,
        AVG(resource_performance_entries.transfer_size) AS average_transfer_size
      FROM
        resource_performance_entries
      JOIN
        page_views ON resource_performance_entries.page_view_uuid = page_views.uuid
      WHERE
        page_views.project_key = $1 AND
        page_views.url_host = $2 AND
        page_views.url_path = $3 AND
        page_views.page_view_ts >= $4
      GROUP BY
        name_to_url_host, name_to_url_path, initiator_type, render_blocking_status
      HAVING
        COUNT(name) >= ${minimumOccurrences}
      ORDER BY
        average_start_time ASC
      LIMIT ${limit}
    `;
    return (await db.query(query, [projectKey, urlHost, urlPath, new Date(startTs)])).rows;
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
        page_views ON resource_performance_entries.page_view_uuid = page_views.uuid
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