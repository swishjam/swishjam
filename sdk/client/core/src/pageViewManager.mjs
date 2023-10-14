export class PageViewManager {
  constructor() {
    this.newPageCallbacks = [];
    this._listenForSoftNavigations();
  }

  currentUrl = () => this._currentUrl;
  previousUrl = () => this._previousUrl || document.referrer;
  millisecondsOnCurrentPage = () => this._arrivedAtCurrentPage ? new Date() - this._arrivedAtCurrentPage : 0;

  onNewPage = callback => {
    this.newPageCallbacks.push(callback);
  }

  recordPageView = () => {
    const url = window.location.href;
    this._previousUrl = this._currentUrl || document.referrer;
    this._currentUrl = url;
    this._arrivedAtCurrentPage = new Date();
    this.newPageCallbacks.forEach(func => func(this.currentUrl(), this.previousUrl()));
  }

  _listenForSoftNavigations = () => {
    window.addEventListener('hashchange', this.recordPageView);
    window.addEventListener('popstate', this.recordPageView);
    if (window.history.pushState) {
      const originalPushState = window.history.pushState
      const self = this;
      window.history.pushState = function () {
        originalPushState.apply(this, arguments);
        self.recordPageView();
      }
    }
  }
}

export default PageViewManager;