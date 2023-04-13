export class WebPageTestResults {
  constructor(results) {
    this.results = results;
  }

  auditedUrl() {
    return this.results.data.url;
  }

  auditDate() {
    return new Date(this.results.data.completed * 1_000).toLocaleString();
  }

  screenshotUrl() {
    return this.results.data.runs["1"]?.firstView?.images?.screenShot;
  }

  lighthouseScore(category = 'performance') {
    const score = this.results.data.lighthouse.categories[category]?.score;
    if (!score) return;
    return score * 100;
  }

  lighthousePerformanceMetrics() {
    const metricsArr = this.results.data.lighthouse?.audits?.metrics?.details?.items;
    return metricsArr[0];
  }

  lighthouseAudits(category = 'performance') {
    const auditTypesForCategory = this.results.data.lighthouse.categories[category].auditRefs
                                      .flatMap(category => category.relevantAudits || [])
                                      .filter((val, index, arr) => arr.indexOf(val) === index );
    const auditsForCategory = auditTypesForCategory.map(auditId => this.results.data.lighthouse.audits[auditId]);
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
    return this.results.data.lighthouse.audits[type];
  }

  filmstrip() {
    return this.results.data.runs["1"].firstView.videoFrames;
  }
}