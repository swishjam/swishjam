import Base from "./base";

export class SlackConnections extends Base {
  static async get() {
    return await this._get('/api/v1/slack_connections')
  }
}

Object.assign(SlackConnections, Base);
export default SlackConnections;