import { CODES_TO_NAME } from "./web-page-test/locations";

export class WebPageTestResults {
  constructor(results) {
    this.results = results;
    this.data = results.data;
    this.lighthouseData = this.data.lighthouse;
    this.firstViewData = this.data.median.firstView;
  }

  id() {
    return this.data.id;
  }

  pending() {
    return this.results.statusCode === 100;
  }

  auditedUrl() {
    return this.data.url;
  }

  auditDate() {
    return new Date(this.data.completed * 1_000).toLocaleString();
  }

  browser() {
    return this.data.location.split(':')[1].split('.')[0];
  }
  
  connection() {
    return this.data.connectivity;
  }

  isMobile() {
    return !!this.data.mobile;
  }

  parsedLocation() {
    return CODES_TO_NAME[this.data.location.split(':')[0]];
  }

  screenshotUrl() {
    return this.firstViewData.images.screenShot;
  }

  performanceData() {
    const performanceData = { 
      TotalBlockingTime: this.firstViewData.TotalBlockingTime, 
      FirstInputDelay: this.firstViewData.maxFID,
      SpeedIndex: this.firstViewData.SpeedIndex,
      TimeToFirstByte: this.firstViewData.TTFB,
    };
    this.firstViewData.chromeUserTiming.forEach(item => performanceData[item.name] = (typeof item.time === 'number' ? item.time : item.value));
    return performanceData;
  }

  lcpImg() {
    return this.firstViewData.LargestContentfulPaintImageURL;
  }

  requestData() {
    return this.firstViewData.requests.map(req => new RequestData(req));
  }

  lighthouseFailed() {
    return this.lighthouseData && Object.keys(this.lighthouseData).length < 2;
  }

  lighthouseScore(category = 'performance') {
    const score = this.lighthouseData.categories[category]?.score;
    if (!score) return;
    return Math.ceil(score * 100);
  }

  lighthousePerformanceMetrics() {
    const metricsArr = this.lighthouseData?.audits?.metrics?.details?.items;
    return metricsArr[0];
  }

  lighthouseAudits(category = 'performance') {
    const categories = this.lighthouseData.categories || {};
    const auditTypesForCategory = categories[category]?.auditRefs
                                      .flatMap(category => (category.relevantAudits || []).concat([category.id]))
                                      .filter((val, index, arr) => arr.indexOf(val) === index ) || [];
    const auditsForCategory = auditTypesForCategory.map(auditId => this.lighthouseData.audits[auditId]);
    let results = { opportunities: [], diagnostics: [], passing: [] };
    auditsForCategory.forEach(audit => {
      audit.score === 1
      ? results.passing.push(audit) 
      : audit.details && audit.details.type === 'opportunity' && typeof audit.score === 'number' && audit.score < 1
        ? results.opportunities.push(audit)
        : audit.details && ['table', 'criticalrequestchain'].includes(audit.details.type)
          ? results.diagnostics.push(audit)
          : null;
    });
    return results;
  }

  getLighthouseAudit(type) {
    return (this.lighthouseData.audits || {})[type];
  }

  lighthouseWarnings() {
    return this.lighthouseData.runWarnings || [];
  }

  filmstrip({ filledIn = true } = {}) {
    if (filledIn) {
      const filmstripObject = {};
      this.firstViewData.videoFrames.forEach(({ time, image, VisuallyComplete }) => filmstripObject[parseFloat(time)] = { time, image, VisuallyComplete });

      const sortedFilmstripTimestamps = Object.keys(filmstripObject).map(ts => parseFloat(ts)).sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
      const maxTs = sortedFilmstripTimestamps[sortedFilmstripTimestamps.length - 1];
      for (let i = 0; i <= maxTs; i += 500) {
        if (!filmstripObject[i]) {
          const closestTs = sortedFilmstripTimestamps.find((ts, j) => i >= ts && i < sortedFilmstripTimestamps[j + 1]);
          filmstripObject[i] = { ...filmstripObject[closestTs], time: i };
        }
      }
      return Object.values(filmstripObject);
    } else {
      return this.firstViewData.videoFrames;
    }
  }
}

class RequestData {
  constructor(requestData) {
    this.payload = requestData;
  }

  url() {
    return this.payload.full_url;
  }

  hostURL() {
    return this.payload.host;
  }

  pathURL() {
    return this.payload.url;
  }

  friendlyURL() {
    return this.hostURL() + this.pathURL();
  }

  requestType() {
    return this.payload.request_type;
  }

  isRenderBlocking() {
    return this.payload.renderBlocking === 'blocking';
  }

  firstTimestamp() {
    return Math.min(...[
      this.waitStart(), this.dnsStart(), this.connectStart(), this.sslStart(), this.ttfbStart(), this.downloadStart()
    ].filter(timestamp => ![null, undefined].includes(timestamp)));
  }

  waitTime() {
    // return 0;
  }

  waitStart() {
    // return 0;
  }

  waitEnd() {
    // return 0;
  }

  dnsTime() {
    return this.payload.dns_ms;
  }

  dnsStart() {
    return this._timestampAboveNegativeOne(this.payload.dns_start);
  }

  dnsEnd() {
    return this.payload.dns_end;
  }

  connectTime() {
    return this.payload.connect_ms;
  }

  connectStart() {
    return this._timestampAboveNegativeOne(this.payload.connect_start);
  }

  connectEnd() {
    return this.payload.connect_end;
  }

  sslTime() {
    return this.payload.ssl_ms;
  }

  sslStart() {
    return this._timestampAboveNegativeOne(this.payload.ssl_start);
  }

  sslEnd() {
    return this.payload.ssl_end;
  }

  ttfbTime() {
    return this.payload.ttfb_ms;
  }

  ttfbStart() {
    return this._timestampAboveNegativeOne(this.payload.ttfb_start);
  }

  ttfbEnd() {
    return this.payload.ttfb_end;
  }

  downloadTime() {
    return this.payload.download_ms;
  }

  downloadStart() {
    return this._timestampAboveNegativeOne(this.payload.download_start);
  }

  downloadEnd() {
    return this.payload.download_end;
  }

  allMs() {
    return this.payload.all_ms;
  }

  size() {
    return this.payload.bytesIn;
  }

  _timestampAboveNegativeOne(timestamp) {
    return timestamp > -1 ? timestamp : null;
  }
}