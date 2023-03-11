import db from '@lib/db';

export default class ResourcePerformanceEntries {
  static async getAll({ 
    projectKey, 
    urlPath,
    urlHost,
    startTs, 
    // metric = 'duration',
    // initiatorTypes,
    limit = 150,
  }) {
    const query = `
      SELECT
        rpe.name AS name,
        rpe.initiator_type,
        SUM(
          CASE rpe.render_blocking_status WHEN 'blocking' THEN 1 ELSE 0 END
        ) as render_blocking_count,
        SUM(
          CASE rpe.render_blocking_status WHEN 'non-blocking' THEN 1 ELSE 0 END
        ) as non_render_blocking_count,
        COUNT(rpe.name) AS count,
        AVG(rpe.start_time) AS average_start_time,
        AVG(rpe.domain_lookup_start) AS average_domain_lookup_start,
        AVG(rpe.domain_lookup_end) AS average_domain_lookup_end,
        AVG(rpe.connect_start) AS average_connect_start,
        AVG(rpe.connect_end) AS average_connect_end,
        AVG(rpe.secure_connection_start) AS average_secure_connection_start,
        AVG(rpe.request_start) AS average_request_start,
        AVG(rpe.response_start) AS average_response_start,
        AVG(rpe.response_end) AS average_response_end,
        AVG(rpe.duration) AS average_duration,
        AVG(rpe.transfer_size) AS average_transfer_size
      FROM
        resource_performance_entries as rpe
      JOIN
        page_views ON rpe.page_view_uuid = page_views.uuid
      WHERE
        page_views.project_key = $1 AND
        page_views.url_host = $2 AND
        page_views.url_path = $3 AND
        page_views.page_view_ts >= $4
      GROUP BY
        name, initiator_type, render_blocking_status
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
        rpe
      JOIN
        page_views AS rpe ON rpe.page_view_uuid = page_views.uuid
      WHERE
        page_views.project_key = $1 AND
        rpe.name = $2 AND
        page_views.page_view_ts >= $3 AND
        rpe.${metric} IS NOT NULL AND
        rpe.${metric} > 0
      GROUP BY
        day, hour, name
      ORDER BY
        day, hour ASC
    `;
    return (await db.query(query, [projectKey, decodeURIComponent(resourceName), new Date(startTs)])).rows;
  }
}