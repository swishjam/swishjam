import Base from "./base";

export class Slack extends Base {
  static async getChannels() {
    return await this._get('/api/v1/slack/channels')
  }
}

Object.assign(Slack, Base);
export default Slack;