module.exports = class PageLeftEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }
  
  async updatePageView() {
    const { pageViewUuid, data } = this.event;
    const { leftPageAtTs } = data; 
    await this.db.client`UPDATE page_views SET page_left_at_ts = ${new Date(leftPageAtTs)} WHERE identifier = ${pageViewUuid}`;
    return true;
  }
}