import Base from "./base";

export class Team extends Base {
  static async users() {
    return await this._get('/api/v1/team/users')
  }
}

Object.assign(Team, Base);
export default Team;