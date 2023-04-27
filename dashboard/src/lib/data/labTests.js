import db from '@lib/db';

export class LabTests {
  static async getAll({ projectKey, urlHost, urlPath, limit = 50 }) {
    if (!projectKey) throw new Error('projectKey is required');
    if (!urlHost) throw new Error('urlHost is required');
    console.log(urlPath)
    if (urlPath) {
      const query = `
        SELECT
          *
        FROM
          synthetic_runs
        WHERE
          project_key = $1 AND
          url_host = $2 AND
          url_path = $3
        ORDER BY
          completed_at DESC
        LIMIT $4
      `;
      return (await db.query(query, [projectKey, decodeURIComponent(urlHost), decodeURIComponent(urlPath), limit])).rows;
    }  else {
      const query = `
        SELECT
          *
        FROM
          synthetic_runs
        WHERE
          project_key = $1 AND
          url_host = $2
        ORDER BY
          completed_at DESC
        LIMIT $3
      `;
      return (await db.query(query, [projectKey, decodeURIComponent(urlHost), limit])).rows;
    }
  }

  static async getUniqueHosts({ projectKey }) {
    const query = `
      SELECT
        DISTINCT url_host
      FROM
        synthetic_runs
      WHERE
        project_key = $1
    `;
    return (await db.query(query, [projectKey])).rows;
  }

  static async getUniquePaths({ projectKey, urlHost }) {
    const query = `
      SELECT
        DISTINCT url_path
      FROM
        synthetic_runs
      WHERE
        project_key = $1 AND
        url_host = $2
    `;
    return (await db.query(query, [projectKey, decodeURIComponent(urlHost)])).rows;
  }
}