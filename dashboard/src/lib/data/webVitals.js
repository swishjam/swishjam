import db from '@lib/db';
import { cwvMetricBounds } from '@/lib/cwvCalculations';
import goodNeedsImprovementPoorQuery from '@/lib/data/webVitalQueries/goodNeedsImprovementPoor';

export default class WebVitalsData {
  static async getPercentilesForAllMetrics({ projectKey, urlHost, urlPath, startTs, percentile }) {
    const query = `
      SELECT
        performance_metrics.metric_name AS name,
        COUNT(*) AS num_records,
        PERCENTILE_CONT(${parseFloat(percentile)}) WITHIN GROUP (ORDER BY performance_metrics.metric_value ASC) AS value
      FROM
        performance_metrics
      JOIN
        page_views ON performance_metrics.page_view_uuid = page_views.uuid
      WHERE
        page_views.project_key = $1 AND
        page_views.url_host = $2 AND
        page_views.url_path = $3 AND
        page_views.page_view_ts >= $4
      GROUP BY
        performance_metrics.metric_name
    `;
    const queryOptions = [projectKey, urlHost, urlPath, new Date(startTs)];
    return (await db.query(query, queryOptions)).rows;
  }

  static async getPercentileForMetric({ projectKey, metric, urlHost, urlPath, percentile = 0.75, startTs }) {
    if (!metric) throw new Error('Missing `metric` query param');
    if (!urlHost) throw new Error('Missing `url_host` query param');
    if (urlPath) {
      const query = `
        SELECT
          CAST(COUNT(*) AS int) AS num_records,
          CAST(PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY metric_value) AS float) AS value
        FROM
          performance_metrics
        JOIN
          page_views ON performance_metrics.page_view_uuid = page_views.uuid
        WHERE
          page_views.project_key = $1 AND
          performance_metrics.metric_name = $2 AND
          page_views.page_view_ts >= $3 AND
          page_views.url_host = $4 AND
          page_views.url_path = $5
      `;
      return (await db.query(query, [projectKey, metric, new Date(startTs), decodeURIComponent(urlHost), decodeURIComponent(urlPath)])).rows[0];
    } else {
      const query = `
        SELECT
          CAST(COUNT(*) AS int) AS num_records,
          CAST(PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY metric_value) AS float) AS value
        FROM
          performance_metrics
        JOIN
          page_views ON performance_metrics.page_view_uuid = page_views.uuid
        WHERE
          page_views.project_key = $1 AND
          performance_metrics.metric_name = $2 AND
          page_views.page_view_ts >= $3 AND
          page_views.url_host = $4
      `;
      return (await db.query(query, [projectKey, metric, new Date(startTs), decodeURIComponent(urlHost)])).rows[0];
    }
  }

  static async getPercentileForMetricsByConnection({ projectKey, urlHost, urlPath, percentile = 0.75, startTs }) {
    if (!projectKey) throw new Error('Missing `projectKey` query param');
    if (!urlHost) throw new Error('Missing `url_host` query param');
    if (urlPath) {
      const query = `
        SELECT
          ((bucket - 1) * (1000 / 20) || '-' || (bucket * 1000 / 20)) AS range,
          count, metric, value FROM(
            SELECT 
              metric_name AS metric,
              CAST(PERCENTILE_CONT(${parseFloat(percentile)}) WITHIN GROUP(ORDER BY metric_value ASC) AS float) AS value,
              width_bucket(connection_rtt, 0, 1000, 20) AS bucket,
              CAST(count(*) AS int) AS count
            FROM 
              performance_metrics 
            JOIN
              page_views ON page_views.uuid = performance_metrics.page_view_uuid
            WHERE
              page_views.project_key = $1 AND
              page_views.page_view_ts >= $2 AND
              page_views.url_host = $3 AND
              page_views.url_path = $4
            GROUP BY 
              bucket, metric
            ORDER BY 
              bucket
          ) AS buckets
      `;
    const result = await db.query(query, [projectKey, new Date(startTs), decodeURIComponent(urlHost), decodeURIComponent(urlPath)]);
      return result.rows;
    } else {
      const query = `
        SELECT
          ((bucket - 1) * (1000 / 20) || '-' || (bucket * 1000 / 20)) AS connection_range,
          count, metric, value FROM(
            SELECT 
              metric_name AS metric,
              CAST(PERCENTILE_CONT(${parseFloat(percentile)}) WITHIN GROUP(ORDER BY metric_value ASC) AS float) AS value,
              width_bucket(connection_rtt, 0, 1000, 20) AS bucket,
              CAST(count(*) AS int) AS count
            FROM 
              performance_metrics 
            JOIN
              page_views ON page_views.uuid = performance_metrics.page_view_uuid
            WHERE
              page_views.project_key = $1 AND
              page_views.page_view_ts >= $2 AND
              page_views.url_host = $3
            GROUP BY 
              bucket, metric
            ORDER BY 
              bucket
          ) AS buckets
      `;
      const result = await db.query(query, [projectKey, new Date(startTs), decodeURIComponent(urlHost)]);
      return result.rows;
    }
  }

  static async getPercentileForMetricsByDevice({ projectKey, urlHost, urlPath, percentile = 0.75, startTs }) {
    if (!projectKey) throw new Error('Missing `projectKey` query param');
    if (!urlHost) throw new Error('Missing `url_host` query param');
    if (urlPath) {
      const query = `
        SELECT
          page_views.device_type AS device_type,
          performance_metrics.metric_name AS metric,
          CAST(COUNT(performance_metrics.id) AS int) AS num_records,
          CAST(PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY performance_metrics.metric_value ASC) AS float) AS value
        FROM
          performance_metrics
        JOIN
          page_views ON performance_metrics.page_view_uuid = page_views.uuid
        WHERE
          page_views.project_key = $1 AND
          page_views.page_view_ts >= $2 AND
          page_views.url_host = $3 AND
          page_views.url_path = $4
        GROUP BY
          device_type, metric
      `;
      const result = await db.query(query, [projectKey, new Date(startTs), decodeURIComponent(urlHost), decodeURIComponent(urlPath)]);
      return result.rows;
    } else {
      const query = `
        SELECT
          page_views.device_type AS device_type,
          performance_metrics.metric_name AS metric,
          CAST(COUNT(performance_metrics.id) AS int) AS num_records,
          CAST(PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY performance_metrics.metric_value ASC) AS float) AS value
        FROM
          performance_metrics
        JOIN
          page_views ON performance_metrics.page_view_uuid = page_views.uuid
        WHERE
          page_views.project_key = $1 AND
          page_views.page_view_ts >= $2 AND
          page_views.url_host = $3
        GROUP BY
          device_type, metric
      `;
      const result = await db.query(query, [projectKey, new Date(startTs), decodeURIComponent(urlHost)]);
      return result.rows;
    }
  }

  static async getPercentileForMetricsByBrowser({ projectKey, urlHost, urlPath, percentile = 0.75, startTs }) {
    if (!projectKey) throw new Error('Missing `projectKey` query param');
    if (!urlHost) throw new Error('Missing `url_host` query param');
    if (urlPath) {
      const query = `
        SELECT
          page_views.device_client_name AS browser_name,
          performance_metrics.metric_name AS metric,
          CAST(COUNT(performance_metrics.id) AS int) AS num_records,
          CAST(PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY performance_metrics.metric_value ASC) AS float) AS value
        FROM
          performance_metrics
        JOIN
          page_views ON performance_metrics.page_view_uuid = page_views.uuid
        WHERE
          page_views.project_key = $1 AND
          page_views.page_view_ts >= $2 AND
          page_views.url_host = $3 AND
          page_views.url_path = $4
        GROUP BY
          browser_name, metric
      `;
      const result = await db.query(query, [projectKey, new Date(startTs), decodeURIComponent(urlHost), decodeURIComponent(urlPath)]);
      return result.rows;
    } else {
      const query = `
        SELECT
          page_views.device_client_name AS browser_name,
          performance_metrics.metric_name AS metric,
          CAST(COUNT(performance_metrics.id) AS int) AS num_records,
          CAST(PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY performance_metrics.metric_value ASC) AS float) AS value
        FROM
          performance_metrics
        JOIN
          page_views ON performance_metrics.page_view_uuid = page_views.uuid
        WHERE
          page_views.project_key = $1 AND
          page_views.page_view_ts >= $2 AND
          page_views.url_host = $3 
        GROUP BY
          browser_name, metric
      `;
      const result = await db.query(query, [projectKey, new Date(startTs), decodeURIComponent(urlHost)]);
      return result.rows;
    }
  }

  static async getPercentileTimeseriesDataForMetric({ projectKey, metric, groupBy = 'day', startTs, urlHost, urlPath, percentile = 0.75 }) {
    if (!projectKey) throw new Error('Missing required parameter: `projectKey`');
    if (!urlHost) throw new Error('Missing required parameter: `urlHost`');
    if (!metric) throw new Error('Missing required parameter: `metric`');
    if (urlPath) {
      const query = `
        SELECT
          CAST(PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY metric_value) AS float) AS value,
          date_trunc('${groupBy}', page_views.page_view_ts) AS date
        FROM
          performance_metrics
        LEFT JOIN
          page_views ON performance_metrics.page_view_uuid = page_views.uuid
        WHERE
          page_views.project_key = $1 AND
          metric_name = $2 AND
          page_views.page_view_ts >= $3 AND
          page_views.url_path = $4 AND
          page_views.url_host = $5
        GROUP BY
          date
      `;
      const results = await db.query(query, [projectKey, metric, new Date(startTs), decodeURIComponent(urlPath), decodeURIComponent(urlHost)]);
      return results.rows;
    } else {
      const query = `
        SELECT
          PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY metric_value) AS value,
          date_trunc('day', page_views.page_view_ts) AS date
        FROM
          performance_metrics
        LEFT JOIN
          page_views ON performance_metrics.page_view_uuid = page_views.uuid
        WHERE
          page_views.project_key = $1 AND
          metric_name = $2 AND
          page_views.page_view_ts >= $3 AND
          page_views.url_host = $4
        GROUP BY
          date
      `;
      const results = await db.query(query, [projectKey, metric, new Date(startTs), decodeURIComponent(urlHost)]);
      return results.rows;
    }
  };

  static async getOldestRecord({ projectKey, urlHost, urlPath, metric }) {
    if (!projectKey) throw new Error('Missing required parameter: `projectKey`');
    if (!urlHost) throw new Error('Missing required parameter: `urlHost`');
    if (!metric) throw new Error('Missing required parameter: `metric`');
    if (urlPath) {
      const query = `
        SELECT
          page_views.page_view_ts AS date
        FROM
          performance_metrics
        LEFT JOIN
          page_views ON performance_metrics.page_view_uuid = page_views.uuid
        WHERE
          page_views.project_key = $1 AND
          metric_name = $2 AND
          page_views.url_host = $3 AND
          page_views.url_path = $4 
        ORDER BY
          page_views.page_view_ts ASC
        LIMIT 1
      `;
      return (await db.query(query, [projectKey, metric, decodeURIComponent(urlHost), decodeURIComponent(urlPath)])).rows[0];
    } else {
      const query = `
        SELECT
          page_views.page_view_ts AS date
        FROM
          performance_metrics
        LEFT JOIN
          page_views ON performance_metrics.page_view_uuid = page_views.uuid
        WHERE
          page_views.project_key = $1 AND
          metric_name = $2 AND
          page_views.url_host = $3
        ORDER BY
          page_views.page_view_ts ASC
        LIMIT 1
      `;
      return (await db.query(query, [projectKey, metric, decodeURIComponent(urlHost)])).rows[0];
    }
  }

  static getGoodNeedsImprovementChartDataDataForMetric = goodNeedsImprovementPoorQuery;

  static async getHistogramData({ projectKey, accronym, urlHost, urlPath, deviceTypes, minimum = 0, maximum, numBuckets = 20, startTs }) {
    if (!projectKey) throw new Error('Missing required parameter: `projectKey`');
    if (!accronym) throw new Error('Missing required parameter: `accronym`');
    if (!urlHost) throw new Error('Missing required parameter: `urlHost`');
    if (urlPath) {
      const query = `
          SELECT 
            (
              (bucket-1) * (${maximum}/${numBuckets}) || 
              '-' || 
              (bucket * ${maximum}/${numBuckets})
            ) AS range, 
            COUNT FROM (
              SELECT 
                width_bucket(metric_value, ${minimum}, ${maximum}, ${numBuckets}) AS bucket, 
                count(*) AS count
              FROM 
                performance_metrics
              LEFT JOIN
                page_views ON performance_metrics.page_view_uuid = page_views.uuid
              WHERE
                page_views.project_key = $1 AND
                metric_name = $2 AND
                page_views.page_view_ts >= $3 AND
                page_views.url_host = $4 AND
                page_views.url_path = $5 AND
                page_views.device_type IN (${deviceTypes.map((_, i) => `$${i + 6}`).join(',')})
              GROUP BY bucket 
              ORDER BY bucket
            ) x;
        `;
      const results = await db.query(query, [projectKey, accronym, new Date(startTs), decodeURIComponent(urlHost), decodeURIComponent(urlPath), ...deviceTypes])
      return results.rows;
    } else {
        const query = `
          SELECT 
            (
              (bucket-1) * (${maximum}/${numBuckets}) || 
              '-' || 
              (bucket * ${maximum}/${numBuckets})
            ) AS range, 
            COUNT FROM (
              SELECT 
                width_bucket(metric_value, ${minimum}, ${maximum}, ${numBuckets}) AS bucket, 
                count(*) AS count
              FROM 
                performance_metrics
              LEFT JOIN
                page_views ON performance_metrics.page_view_uuid = page_views.uuid
              WHERE
                page_views.project_key = $1 AND
                metric_name = $2 AND
                page_views.page_view_ts >= $3 AND
                page_views.url_host = $4 AND
                page_views.device_type IN (${deviceTypes.map((_, i) => `$${i + 5}`).join(',')})
              GROUP BY bucket 
              ORDER BY bucket
            ) x;
        `;
        const results = await (db.query(query, [projectKey, accronym, new Date(startTs), decodeURIComponent(urlHost), ...deviceTypes]))
        return results.rows;
    }
  }
}