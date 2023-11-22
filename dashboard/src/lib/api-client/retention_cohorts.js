import Base from "./base";

export class RetentionCohorts extends Base {
  static async get({ numOfCohorts = 3 } = {}) {
    return await this._get('/api/v1/retention_cohorts', { num_of_cohorts: numOfCohorts });
  }
}

Object.assign(RetentionCohorts, Base);
export default RetentionCohorts;