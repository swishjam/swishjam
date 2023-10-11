import Base from "../base";

export class Referrers extends Base {
  static async list(options = {}) {
    return await this._get("/api/v1/sessions/referrers", { options })
  }
}

Object.assign(Referrers, Base);

export default Referrers;