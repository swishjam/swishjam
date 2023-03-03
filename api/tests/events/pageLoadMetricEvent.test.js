const PageLoadMetricEvent = require('../../src/events/pageLoadMetricEvent');
const DB = require('../../src/db');
const { prepareDb } = require('../db');

describe('PageLoadMetricEvent', () => {
  beforeEach(async () => await prepareDb());
  
  it('it does nothing if it\'s an unrecognized metric', async () => {
    const data = {
      uuid: 'metric-123',
      pageViewUuid: 'page-view-identifier-xyz',
      siteId: 'site-identifier-123',
      data: {
        type: 'FAKE_METRIC',
        value: 100
      }
    }
    const db = DB.connect();
    await new PageLoadMetricEvent(data, db).createPerformanceMetric();
    const allPageLoadMetrics = await db.client`SELECT * FROM performance_metrics`;
    expect(allPageLoadMetrics).toHaveLength(0);
  })
  
  it('it creates a new performance_metric', async () => {
    const data = {
      uuid: 'metric-123',
      pageViewUuid: 'page-view-identifier-xyz',
      siteId: 'site-identifier-123',
      data: {
        type: 'FCP',
        value: 100
      }
    }
    const db = DB.connect();
    await new PageLoadMetricEvent(data, db).createPerformanceMetric();
    const allPageLoadMetrics = await db.client`SELECT * FROM performance_metrics`;
    expect(allPageLoadMetrics).toHaveLength(1);
    expect(allPageLoadMetrics[0].uuid).toEqual(data.uuid);
    expect(allPageLoadMetrics[0].unique_identifier).toEqual(data.uuid);
    expect(allPageLoadMetrics[0].page_view_uuid).toEqual(data.pageViewUuid);
    expect(allPageLoadMetrics[0].page_view_identifier).toEqual(data.pageViewUuid);
    expect(allPageLoadMetrics[0].site_id).toEqual(data.siteId);
    expect(allPageLoadMetrics[0].metric_name).toEqual('FCP');
    expect(allPageLoadMetrics[0].metric_value).toEqual('100');
  })

  it('it uses the legacy `_identifier` columns when `uuids` are not present', async () => {
    const data = {
      uniqueIdentifier: 'metric-123',
      pageViewIdentifier: 'page-view-identifier-xyz',
      siteId: 'site-identifier-123',
      data: {
        type: 'FCP',
        value: 100
      }
    }
    const db = DB.connect();
    await new PageLoadMetricEvent(data, db).createPerformanceMetric();
    const allPageLoadMetrics = await db.client`SELECT * FROM performance_metrics`;
    expect(allPageLoadMetrics).toHaveLength(1);
    expect(allPageLoadMetrics[0].uuid).toEqual(data.uniqueIdentifier);
    expect(allPageLoadMetrics[0].unique_identifier).toEqual(data.uniqueIdentifier);
    expect(allPageLoadMetrics[0].page_view_uuid).toEqual(data.pageViewIdentifier);
    expect(allPageLoadMetrics[0].page_view_identifier).toEqual(data.pageViewIdentifier);
    expect(allPageLoadMetrics[0].site_id).toEqual(data.siteId);
    expect(allPageLoadMetrics[0].metric_name).toEqual('FCP');
    expect(allPageLoadMetrics[0].metric_value).toEqual('100');
  })
  
  it('it updates the performance_metric if it receives new data with the same page identifier and the value is larger than the existing record', async () => {
    const data1 = {
      uniqueIdentifier: 'metric-123',
      pageViewIdentifier: 'page-view-identifier-xyz',
      siteId: 'site-identifier-123',
      data: { type: 'FCP', value: 100 }
    }
    const data2 = {
      uniqueIdentifier: 'metric-123',
      pageViewIdentifier: 'page-view-identifier-xyz',
      siteId: 'site-identifier-123',
      data: { type: 'FCP', value: 200 }
    }
    const db = DB.connect();
    await new PageLoadMetricEvent(data1, db).createPerformanceMetric();
    await new PageLoadMetricEvent(data2, db).createPerformanceMetric();
    const allPageLoadMetrics = await db.client`SELECT * FROM performance_metrics`;
    expect(allPageLoadMetrics).toHaveLength(1);
    expect(allPageLoadMetrics[0].page_view_identifier).toEqual(data2.pageViewIdentifier);
    expect(allPageLoadMetrics[0].metric_name).toEqual('FCP');
    expect(allPageLoadMetrics[0].metric_value).toEqual('200');
  })
  
  it('it does not update the record if it has the same page identifier but the value is less than the existing record', async () => {
    const data1 = {
      uniqueIdentifier: 'metric-123',
      pageViewIdentifier: 'page-view-identifier-xyz',
      siteId: 'site-identifier-123',
      data: { type: 'FCP', value: 100 }
    }
    const data2 = {
      uniqueIdentifier: 'metric-123',
      pageViewIdentifier: 'page-view-identifier-xyz',
      siteId: 'site-identifier-123',
      data: { type: 'FCP', value: 50 }
    }
    const db = DB.connect();
    await new PageLoadMetricEvent(data1, db).createPerformanceMetric();
    await new PageLoadMetricEvent(data2, db).createPerformanceMetric();
    const allPageLoadMetrics = await db.client`SELECT * FROM performance_metrics`;
    expect(allPageLoadMetrics).toHaveLength(1);
    expect(allPageLoadMetrics[0].page_view_identifier).toEqual(data2.pageViewIdentifier);
    expect(allPageLoadMetrics[0].metric_name).toEqual('FCP');
    expect(allPageLoadMetrics[0].metric_value).toEqual('100');
  })
});