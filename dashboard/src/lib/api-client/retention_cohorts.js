import Base from "./base";

export class RetentionCohorts extends Base {
  static async get() {
    return await this._get('/api/v1/retention_cohorts');
  }
}

Object.assign(RetentionCohorts, Base);
export default RetentionCohorts;