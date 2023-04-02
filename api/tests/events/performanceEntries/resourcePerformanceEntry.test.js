const { prepareDb } = require('../../db');
const DB = require('../../../src/db');
const ResourcePerformanceEntryEvent = require('../../../src/events/performanceEntries/resourcePerformanceEntryEvent');

const EVENT_DATA = {
  uuid: 'resource-123',
  pageViewUuid: 'page-view-identifier-xyz',
  projectKey: 'site-identifier-123',
  data: {
    "name": encodeURIComponent("https://cdn.swishjam.com/latest/src.js"),
    "entryType": "resource",
    "startTime": 50.5,
    "duration": 369.5,
    "initiatorType": "script",
    "nextHopProtocol": "h2",
    "renderBlockingStatus": "non-blocking",
    "workerStart": 0,
    "redirectStart": 0,
    "redirectEnd": 0,
    "fetchStart": 50.5,
    "domainLookupStart": 76.10000000009313,
    "domainLookupEnd": 76.10000000009313,
    "connectStart": 76.10000000009313,
    "secureConnectionStart": 394.3000000002794,
    "connectEnd": 406.20000000018626,
    "requestStart": 406.3000000002794,
    "responseStart": 419.40000000037253,
    "responseEnd": 420,
    "transferSize": 6340,
    "encodedBodySize": 6040,
    "decodedBodySize": 24540,
    "responseStatus": 0,
    "serverTiming": [
      {
        "name": "cdn-cache-hit",
        "duration": 0,
        "description": ""
      },
      {
        "name": "cdn-pop",
        "duration": 0,
        "description": "SFO5-P2"
      },
      {
        "name": "cdn-rid",
        "duration": 0,
        "description": "r1SHpbM-CZtK4bHiFJgGhrvU_BZUnNyprNWaZdLrad1Rx2Mdc_bZuw=="
      },
      {
        "name": "cdn-hit-layer",
        "duration": 0,
        "description": "EDGE"
      },
      {
        "name": "cdn-downstream-fbl",
        "duration": 4,
        "description": ""
      }
    ]
  }
}

const NON_DETAILED_EVENT_DATA = {
  uuid: 'resource-123',
  pageViewUuid: 'page-view-identifier-xyz',
  projectKey: 'site-identifier-123',
  data: {
    "name": encodeURIComponent("https://cdn.swishjam.com/latest/src.js"),
    "entryType": "resource",
    "startTime": 50.5,
    "duration": 369.5,
    "initiatorType": "script",
    "nextHopProtocol": "h2",
    "renderBlockingStatus": "non-blocking",
    "workerStart": 0,
    "redirectStart": 0,
    "redirectEnd": 0,
    "fetchStart": 50.5,
    "domainLookupStart": 0,
    "domainLookupEnd": 0,
    "connectStart": 0,
    "secureConnectionStart": 0,
    "connectEnd": 0,
    "requestStart": 0,
    "responseStart": 0,
    "responseEnd": 420,
    "transferSize": 0,
    "encodedBodySize": 0,
    "decodedBodySize": 0,
    "responseStatus": 0,
    "serverTiming": [
      {
        "name": "cdn-cache-hit",
        "duration": 0,
        "description": ""
      },
      {
        "name": "cdn-pop",
        "duration": 0,
        "description": "SFO5-P2"
      },
      {
        "name": "cdn-rid",
        "duration": 0,
        "description": "r1SHpbM-CZtK4bHiFJgGhrvU_BZUnNyprNWaZdLrad1Rx2Mdc_bZuw=="
      },
      {
        "name": "cdn-hit-layer",
        "duration": 0,
        "description": "EDGE"
      },
      {
        "name": "cdn-downstream-fbl",
        "duration": 4,
        "description": ""
      }
    ]
  }
}

describe('ResourcePerformanceEntry', () => {
  beforeEach(async () => await prepareDb());

  it('creates a resource_performance_entry with detailed timings', async () => {
    const db = DB.connect();
    await new ResourcePerformanceEntryEvent(EVENT_DATA, db).create();
    const resources = await db.client`SELECT * FROM resource_performance_entries`;
    expect(resources.length).toEqual(1);
    expect(resources[0].uuid).toEqual(EVENT_DATA.uuid);
    expect(resources[0].page_view_uuid).toEqual(EVENT_DATA.pageViewUuid);
    expect(resources[0].project_key).toEqual(EVENT_DATA.projectKey);
    expect(resources[0].name).toEqual(decodeURIComponent(EVENT_DATA.data.name));
    expect(resources[0].entry_type).toEqual(EVENT_DATA.data.entryType);
    expect(resources[0].start_time).toEqual(EVENT_DATA.data.startTime.toString());
    expect(resources[0].duration).toEqual(EVENT_DATA.data.duration.toString());
    expect(resources[0].initiator_type).toEqual(EVENT_DATA.data.initiatorType.toString());
    expect(resources[0].next_hop_protocol).toEqual(EVENT_DATA.data.nextHopProtocol.toString());
    expect(resources[0].render_blocking_status).toEqual(EVENT_DATA.data.renderBlockingStatus.toString());
    expect(resources[0].worker_start).toEqual(EVENT_DATA.data.workerStart.toString());
    expect(resources[0].redirect_start).toEqual(EVENT_DATA.data.redirectStart.toString());
    expect(resources[0].redirect_end).toEqual(EVENT_DATA.data.redirectEnd.toString());
    expect(resources[0].fetch_start).toEqual(EVENT_DATA.data.fetchStart.toString());
    expect(resources[0].domain_lookup_start).toEqual(EVENT_DATA.data.domainLookupStart.toString());
    expect(resources[0].domain_lookup_end).toEqual(EVENT_DATA.data.domainLookupEnd.toString());
    expect(resources[0].connect_start).toEqual(EVENT_DATA.data.connectStart.toString());
    expect(resources[0].secure_connection_start).toEqual(EVENT_DATA.data.secureConnectionStart.toString());
    expect(resources[0].connect_end).toEqual(EVENT_DATA.data.connectEnd.toString());
    expect(resources[0].request_start).toEqual(EVENT_DATA.data.requestStart.toString());
    expect(resources[0].response_start).toEqual(EVENT_DATA.data.responseStart.toString());
    expect(resources[0].response_end).toEqual(EVENT_DATA.data.responseEnd.toString());
    expect(resources[0].transfer_size).toEqual(EVENT_DATA.data.transferSize.toString());
    expect(resources[0].encoded_body_size).toEqual(EVENT_DATA.data.encodedBodySize.toString());
    expect(resources[0].decoded_body_size).toEqual(EVENT_DATA.data.decodedBodySize.toString());

    expect(resources[0].name_to_url_host).toEqual('cdn.swishjam.com');
    expect(resources[0].name_to_url_path).toEqual('/latest/src.js');
    expect(resources[0].name_to_url_query).toEqual('');
    

    const firstTime = EVENT_DATA.data.domainLookupStart || EVENT_DATA.data.secureConnectionStart || EVENT_DATA.data.requestStart || EVENT_DATA.data.fetchStart;
    expect(resources[0].waiting_duration).toEqual((firstTime - EVENT_DATA.data.fetchStart).toString())
    expect(resources[0].redirect_duration).toEqual((EVENT_DATA.data.redirectEnd - EVENT_DATA.data.redirectStart).toString())
    // expect(resources[0].service_worker_duration).toEqual((EVENT_DATA.data.responseEnd - (EVENT_DATA.data.workerStart || EVENT_DATA.data.responseEnd)).toString())
    expect(resources[0].dns_lookup_duration).toEqual((EVENT_DATA.data.domainLookupEnd - EVENT_DATA.data.domainLookupStart).toString())
    expect(resources[0].tcp_duration).toEqual((EVENT_DATA.data.secureConnectionStart - EVENT_DATA.data.connectStart).toString())
    expect(resources[0].ssl_duration).toEqual((EVENT_DATA.data.connectEnd - EVENT_DATA.data.secureConnectionStart).toString())
    expect(resources[0].request_duration).toEqual((EVENT_DATA.data.responseStart - EVENT_DATA.data.requestStart).toString())
    expect(resources[0].response_duration).toEqual((EVENT_DATA.data.responseEnd - EVENT_DATA.data.responseStart).toString())
  });
  
  it('creates a resource_performance_entry without detailed timings', async () => {
    const db = DB.connect();
    await new ResourcePerformanceEntryEvent(NON_DETAILED_EVENT_DATA, db).create();
    const resources = await db.client`SELECT * FROM resource_performance_entries`;
    expect(resources.length).toEqual(1);
    expect(resources[0].uuid).toEqual(NON_DETAILED_EVENT_DATA.uuid);
    expect(resources[0].page_view_uuid).toEqual(NON_DETAILED_EVENT_DATA.pageViewUuid);
    expect(resources[0].project_key).toEqual(NON_DETAILED_EVENT_DATA.projectKey);
    expect(resources[0].name).toEqual(decodeURIComponent(NON_DETAILED_EVENT_DATA.data.name));
    expect(resources[0].entry_type).toEqual(NON_DETAILED_EVENT_DATA.data.entryType);
    expect(resources[0].start_time).toEqual(NON_DETAILED_EVENT_DATA.data.startTime.toString());
    expect(resources[0].duration).toEqual(NON_DETAILED_EVENT_DATA.data.duration.toString());
    expect(resources[0].initiator_type).toEqual(NON_DETAILED_EVENT_DATA.data.initiatorType.toString());
    expect(resources[0].next_hop_protocol).toEqual(NON_DETAILED_EVENT_DATA.data.nextHopProtocol.toString());
    expect(resources[0].render_blocking_status).toEqual(NON_DETAILED_EVENT_DATA.data.renderBlockingStatus.toString());
    expect(resources[0].worker_start).toEqual(NON_DETAILED_EVENT_DATA.data.workerStart.toString());
    expect(resources[0].redirect_start).toEqual(NON_DETAILED_EVENT_DATA.data.redirectStart.toString());
    expect(resources[0].redirect_end).toEqual(NON_DETAILED_EVENT_DATA.data.redirectEnd.toString());
    expect(resources[0].fetch_start).toEqual(NON_DETAILED_EVENT_DATA.data.fetchStart.toString());
    expect(resources[0].domain_lookup_start).toEqual(NON_DETAILED_EVENT_DATA.data.domainLookupStart.toString());
    expect(resources[0].domain_lookup_end).toEqual(NON_DETAILED_EVENT_DATA.data.domainLookupEnd.toString());
    expect(resources[0].connect_start).toEqual(NON_DETAILED_EVENT_DATA.data.connectStart.toString());
    expect(resources[0].secure_connection_start).toEqual(NON_DETAILED_EVENT_DATA.data.secureConnectionStart.toString());
    expect(resources[0].connect_end).toEqual(NON_DETAILED_EVENT_DATA.data.connectEnd.toString());
    expect(resources[0].request_start).toEqual(NON_DETAILED_EVENT_DATA.data.requestStart.toString());
    expect(resources[0].response_start).toEqual(NON_DETAILED_EVENT_DATA.data.responseStart.toString());
    expect(resources[0].response_end).toEqual(NON_DETAILED_EVENT_DATA.data.responseEnd.toString());
    expect(resources[0].transfer_size).toEqual(NON_DETAILED_EVENT_DATA.data.transferSize.toString());
    expect(resources[0].encoded_body_size).toEqual(NON_DETAILED_EVENT_DATA.data.encodedBodySize.toString());
    expect(resources[0].decoded_body_size).toEqual(NON_DETAILED_EVENT_DATA.data.decodedBodySize.toString());

    expect(resources[0].name_to_url_host).toEqual('cdn.swishjam.com');
    expect(resources[0].name_to_url_path).toEqual('/latest/src.js');
    expect(resources[0].name_to_url_query).toEqual('');

    expect(resources[0].waiting_duration).toEqual(null)
    expect(resources[0].redirect_duration).toEqual(null)
    // expect(resources[0].service_worker_duration).toEqual(null)
    expect(resources[0].dns_lookup_duration).toEqual(null)
    expect(resources[0].tcp_duration).toEqual(null)
    expect(resources[0].ssl_duration).toEqual(null)
    expect(resources[0].request_duration).toEqual(null)
    expect(resources[0].response_duration).toEqual(null)
  });
});