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
    return this.firstViewData.requests;
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