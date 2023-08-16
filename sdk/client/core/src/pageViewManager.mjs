export class PageViewManager {
  constructor(callback) {
    this.callback = callback;
    this._listenForSoftNavigations();
  }

  trackPageView = () => {
    const url = window.location.href;
    const previousUrl = this.currentUrl || document.referrer;
    this.currentUrl = url;
    this.callback({ url, previousUrl });
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