import Base from "../base";

export class Retention extends Base {
  static async get() {
    return await this._get('/api/v1/users/retention');
  }
}

Object.assign(Retention, Base);
export default Retention;