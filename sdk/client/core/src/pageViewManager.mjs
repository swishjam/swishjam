export class PageViewManager {
  constructor() {
    this.newPageCallbacks = [];
    this._listenForSoftNavigations();
  }

  currentUrl = () => this._currentUrl;
  previousUrl = () => this._previousUrl;

  onNewPage = callback => {
    this.newPageCallbacks.push(callback);
  }

  trackPageView = () => {
    const url = window.location.href;
    this._previousUrl = this._currentUrl || document.referrer;
    this._currentUrl = url;
    this.newPageCallbacks.forEach(func => func(this.currentUrl(), this.previousUrl()));
  }

  _listenForSoftNavigations = () => {
    window.addEventListener('hashchange', this.trackPageView);
    window.addEventListener('popstate', this.trackPageView);
    if (window.history.pushState) {
      const originalPushState = window.history.pushState
      const self = this;
      window.history.pushState = function () {
        originalPushState.apply(this, arguments);
        self.trackPageView();
      }
    }
  }
}