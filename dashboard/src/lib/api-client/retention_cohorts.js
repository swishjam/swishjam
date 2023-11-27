import Base from "./base";

export class RetentionCohorts extends Base {
  static async get({ numCohorts = 3 } = {}) {
    return await this._get('/api/v1/retention_cohorts', { num_cohorts: numCohorts });
  }
}

Object.assign(RetentionCohorts, Base);
export default RetentionCohorts;