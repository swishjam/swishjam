import { UuidGenerator } from "./uuidGenerator";

export class PageViewTracker {
  constructor(reportingHandler) {
    this.reportingHandler = reportingHandler;
    window.addEventListener('beforeunload', () => this._reportPageLeftAtTsIfNecessary());
  }

  trackPageView({ previousPageUrl }) {
    this._reportPageLeftAtTsIfNecessary();
    this.currentPageViewIdentifier = UuidGenerator.generate('page-view');
    this.reportingHandler.setCurrentPageViewIdentifier(this.currentPageViewIdentifier);
    this.reportingHandler.recordEvent('PAGE_VIEW', this.currentPageViewIdentifier, {
      pageLoadTs: Date.now(),
      url: window.location.href,
      referrerUrl: previousPageUrl,
      userAgent: window.navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      connection: {
        effectiveType: window.navigator.connection.effectiveType,
        downlink: window.navigator.connection.downlink,
        rtt: window.navigator.connection.rtt,
      }
    });
    return window.location.href;
  }

  _reportPageLeftAtTsIfNecessary() {
    if (!this.currentPageViewIdentifier) return;
    this.reportingHandler.recordEvent('PAGE_LEFT', UuidGenerator.generate('page-left'), { 
      pageLoadId: this.currentPageViewIdentifier,
      leftPageAtTs: Date.now(),
    });
    this.reportingHandler.reportData();
  }
}