import db from '@lib/db';

export default class ResourcePerformanceEntries {
  static async getTimeSeriesForUrl({ projectKey, url, startTs, percentile = 0.75 }) {
    const query = `
      SELECT
        name,
        initiator_type,
        CAST(COUNT(name) AS int) AS total_count,
        date_trunc('hour', page_views.page_view_ts) AS hour,
        date_trunc('day', page_views.page_view_ts) AS day,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY start_time ASC) AS start_time,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY waiting_duration ASC) AS waiting_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY redirect_duration ASC) AS redirect_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY dns_lookup_duration ASC) AS dns_lookup_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY tcp_duration ASC) AS tcp_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY ssl_duration ASC) AS ssl_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY request_duration ASC) AS request_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY response_duration ASC) AS response_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY duration ASC) AS duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY transfer_size ASC) AS transfer_size,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY decoded_body_size ASC) AS decoded_body_size,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY encoded_body_size ASC) AS encoded_body_size,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY fetch_start ASC) AS fetch_start
      FROM
        resource_performance_entries
      JOIN
        page_views ON resource_performance_entries.page_view_uuid = page_views.uuid
      WHERE
        page_views.project_key = $1 AND
        name = $2 AND
        page_views.page_view_ts >= $3
      GROUP BY
        name, initiator_type, hour, day
      ORDER BY
        day, hour
    `;
    return (await db.query(query, [projectKey, decodeURIComponent(url), new Date(startTs)])).rows;
  }

  static async getMetricsForUrl({ projectKey, url, startTs, percentile = 0.75 }) {
    const query = `
      SELECT
        name,
        COUNT(name) AS total_count,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY start_time ASC) AS start_time,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY waiting_duration ASC) AS waiting_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY redirect_duration ASC) AS redirect_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY dns_lookup_duration ASC) AS dns_lookup_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY tcp_duration ASC) AS tcp_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY ssl_duration ASC) AS ssl_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY request_duration ASC) AS request_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY response_duration ASC) AS response_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY duration ASC) AS duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY transfer_size ASC) AS transfer_size,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY decoded_body_size ASC) AS decoded_body_size,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY encoded_body_size ASC) AS encoded_body_size
      FROM
        resource_performance_entries
      JOIN
        page_views ON resource_performance_entries.page_view_uuid = page_views.uuid
      WHERE
        page_views.project_key = $1 AND
        name = $2 AND
        page_views.page_view_ts >= $3
      GROUP BY
        name
    `;
    return (await db.query(query, [projectKey, decodeURIComponent(url), new Date(startTs)])).rows[0];
  }

  static async getAll({ 
    projectKey, 
    urlPath,
    urlHost,
    startTs, 
    percentile = 0.75,
    limit = 150,
    minimumOccurrences = 10,
  }) {
    const query = `
      SELECT
        name,
        rpe.render_blocking_status,
        rpe.initiator_type,
        CAST(COUNT(rpe.name) AS int) AS total_count,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.start_time ASC) AS start_time,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.duration ASC) AS duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.waiting_duration ASC) AS waiting_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.redirect_duration ASC) AS redirect_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.dns_lookup_duration ASC) AS dns_lookup_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.tcp_duration ASC) AS tcp_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.ssl_duration ASC) AS ssl_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.request_duration ASC) AS request_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.response_duration ASC) AS response_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.transfer_size ASC) AS transfer_size,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.decoded_body_size ASC) AS decoded_body_size,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.encoded_body_size ASC) AS encoded_body_size,

        CAST(SUM(CASE WHEN rpe.transfer_size = 0 THEN 1 ELSE 0 END) AS int) AS local_cache_hit_count,
        CAST(SUM(CASE WHEN rpe.transfer_size > 0 THEN 1 ELSE 0 END) AS int) AS local_cache_miss_count,
        CAST(SUM(CASE WHEN rpe.encoded_body_size != rpe.decoded_body_size THEN 1 ELSE 0 END) AS int) AS compressed_count,
        CAST(SUM(CASE WHEN rpe.encoded_body_size != rpe.decoded_body_size THEN 0 ELSE 1 END) AS int) AS not_compressed_count
      FROM
        resource_performance_entries as rpe
      JOIN
        page_views AS pv ON rpe.page_view_uuid = pv.uuid
      WHERE
        pv.project_key = $1 AND
        pv.url_host = $2 AND
        pv.url_path = $3 AND
        pv.page_view_ts >= $4
      GROUP BY
        name, initiator_type, render_blocking_status
      HAVING
        COUNT(name) >= ${minimumOccurrences}
      ORDER BY
        start_time ASC
      LIMIT ${limit}
    `;
    return (await db.query(query, [projectKey, urlHost, urlPath, new Date(startTs)])).rows;
  }

  static async getTimeseriesForMetric({ projectKey, resourceName, metric, startTs }) {
    const query = `
      SELECT
        rpe.name AS name,
        AVG(${metric}) AS metric,
        date_trunc('hour', pv.page_view_ts) AS hour,
        date_trunc('day', pv.page_view_ts) AS day
      FROM
        resource_performance_entries  AS rpe
      JOIN
        page_views AS pv ON rpe.page_view_uuid = pv.uuid
      WHERE
        pv.project_key = $1 AND
        rpe.name = $2 AND
        pv.page_view_ts >= $3 AND
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