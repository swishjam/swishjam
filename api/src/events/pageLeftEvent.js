module.exports = class PageLeftEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }
  
  async updatePageView() {
    const { pageViewIdentifier, data } = this.event;
    const { pageLeftTs } = data; 
    return await this.db.client`UPDATE page_views SET page_left_ts = ${pageLeftTs} WHERE identifier = ${pageViewIdentifier}`;
  }
}