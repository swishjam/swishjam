const LongTaskPerformanceEntryEvent = require('../../../src/events/performanceEntries/longTaskPerformanceEntryEvent');
const { prepareDb } = require('../../db');
const DB = require('../../../src/db');

const EVENT_DATA = {
  uniqueIdentifier: 'longtask-123',
  pageViewIdentifier: 'page-view-identifier-xyz',
  siteId: 'site-identifier-123',
  data: {
    duration: 150,
    entryType: 'longtask',
    name: encodeURIComponent('https://www.collin.com/longtask'),
    startTime: 500,
    attribution: []
  }
}

describe('LongTaskPerformanceEntry', () => {
  beforeEach(async () => await prepareDb());

  it('creates a longtask_performance_entry', async () => {
    const db = DB.connect();
    await new LongTaskPerformanceEntryEvent(EVENT_DATA, db).create();
    const longTasks = await db.client`SELECT * FROM longtask_performance_entries`;
    expect(longTasks).toHaveLength(1);
    expect(longTasks[0].page_view_identifier).toEqual(EVENT_DATA.pageViewIdentifier);
    expect(longTasks[0].duration).toEqual(EVENT_DATA.data.duration.toString());
    expect(longTasks[0].entry_type).toEqual(EVENT_DATA.data.entryType);
    expect(longTasks[0].name).toEqual(decodeURIComponent(EVENT_DATA.data.name));
    expect(longTasks[0].start_time).toEqual(EVENT_DATA.data.startTime.toString());
  });

  it('creates longtask_task_attribution_performance_entries', async () => {
    const db = DB.connect();
    EVENT_DATA.data.attribution = [
      {
        duration: 100,
        entryType: 'taskattribution',
        name: encodeURIComponent('https://www.collin.com/task-attribution-name'),
        startTime: 1000,
        containerType: 'script',
        containerSrc: encodeURIComponent('https://www.collin.com/task-attribution-container-src'),
        containerId: 'blah',
        containerName: 'foo-bar',
      }
    ];
    await new LongTaskPerformanceEntryEvent(EVENT_DATA, db).create();
    const longtaskAttributions = await db.client`SELECT * FROM longtask_task_attribution_performance_entries`;
    expect(longtaskAttributions).toHaveLength(1);
    expect(longtaskAttributions[0].unique_identifier).toEqual(`${EVENT_DATA.uniqueIdentifier}-0`);
    expect(longtaskAttributions[0].longtask_unique_identifier).toEqual(EVENT_DATA.uniqueIdentifier);
    expect(longtaskAttributions[0].page_view_identifier).toEqual(EVENT_DATA.pageViewIdentifier);
    expect(longtaskAttributions[0].site_id).toEqual(EVENT_DATA.siteId);
    expect(longtaskAttributions[0].duration).toEqual(EVENT_DATA.data.attribution[0].duration.toString());
    expect(longtaskAttributions[0].entry_type).toEqual(EVENT_DATA.data.attribution[0].entryType);
    expect(longtaskAttributions[0].name).toEqual(decodeURIComponent(EVENT_DATA.data.attribution[0].name));
    expect(longtaskAttributions[0].start_time).toEqual(EVENT_DATA.data.attribution[0].startTime.toString());
    expect(longtaskAttributions[0].container_type).toEqual(EVENT_DATA.data.attribution[0].containerType);
    expect(longtaskAttributions[0].container_src).toEqual(decodeURIComponent(EVENT_DATA.data.attribution[0].containerSrc));
    expect(longtaskAttributions[0].container_id).toEqual(EVENT_DATA.data.attribution[0].containerId);
    expect(longtaskAttributions[0].container_name).toEqual(EVENT_DATA.data.attribution[0].containerName);
  });
});