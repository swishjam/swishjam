import Base from "./base";

export class Config extends Base {
  static async retrieve() {
    return await this._get('/api/v1/config');
  }
}

Object.assign(Config, Base);
export default Config;