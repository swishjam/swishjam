module.exports = class PageLeftEvent {
  constructor(event, db) {
    this.event = event;
    this.db = db;
  }
  
  async updatePageView() {
    const { pageViewIdentifier, data } = this.event;
    const { leftPageAtTs } = data; 
    console.log(`Updating page view ${pageViewIdentifier} with page left timestamp ${leftPageAtTs} (converted to ${new Date(leftPageAtTs)})`);
    await this.db.client`UPDATE page_views SET left_page_at_ts = ${new Date(leftPageAtTs)} WHERE identifier = ${pageViewIdentifier}`;
    return true;
  }
}