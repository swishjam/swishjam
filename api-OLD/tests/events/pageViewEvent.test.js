const PageViewEvent = require('../../src/events/pageViewEvent');
const DB = require('../../src/db');
const { prepareDb } = require('../db');

describe('PageViewEvent', () => {
  beforeEach(async () => await prepareDb());

  it('creates a new page_view record', async () => {
    const exampleData = {
      uuid: 'page-view-identifier-xyz',
      projectKey: 'site-identifier-123',
      data: {
        pageLoadTs: Date.now(),
        navigationType: 'hard',
        url: 'https://example.com',
        referrerUrl: 'https://referrer.com',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        screenWidth: 1920,
        screenHeight: 1080,
        connection: {
          effectiveType: '4g',
          downlink: 10,
          rtt: 50,
        }
      }
    };
    
    const db = DB.connect();
    await new PageViewEvent(exampleData, db).createPageView();
    const allPageViews = await db.client`SELECT * FROM page_views`;
  
    expect(allPageViews).toHaveLength(1);
    expect(allPageViews[0].uuid).toEqual(exampleData.uuid);
    expect(allPageViews[0].project_key).toEqual(exampleData.projectKey);
    expect(allPageViews[0].full_url).toEqual(exampleData.data.url);
    expect(allPageViews[0].url_path).toEqual(new URL(exampleData.data.url).pathname);
    expect(allPageViews[0].url_host).toEqual(new URL(exampleData.data.url).hostname);
    expect(allPageViews[0].referrer_full_url).toEqual(exampleData.data.referrerUrl);
    expect(allPageViews[0].referrer_url_path).toEqual(new URL(exampleData.data.referrerUrl).pathname);
    expect(allPageViews[0].referrer_url_host).toEqual(new URL(exampleData.data.referrerUrl).hostname);
    expect(allPageViews[0].user_agent).toEqual(exampleData.data.userAgent);
    expect(allPageViews[0].screen_width).toEqual(exampleData.data.screenWidth.toString());
    expect(allPageViews[0].screen_height).toEqual(exampleData.data.screenHeight.toString());
    expect(allPageViews[0].connection_effective_type).toEqual(exampleData.data.connection.effectiveType);
    expect(allPageViews[0].connection_downlink).toEqual(exampleData.data.connection.downlink.toString());
    expect(allPageViews[0].connection_rtt).toEqual(exampleData.data.connection.rtt.toString());
    expect(allPageViews[0].navigation_type).toEqual(exampleData.data.navigationType);
    expect(allPageViews[0].page_view_ts).toEqual(new Date(exampleData.data.pageLoadTs));
  });

  it('does not create a new page_view record if one with the same unique identifier already exists', async () => {
    const exampleData = {
      // pageViewUuid: 'page-view-identifier-xyz',
      uuid: 'page-view-identifier-xyz',
      projectKey: 'site-identifier-123',
      data: {
        pageLoadTs: Date.now(),
        navigationType: 'hard',
        url: 'https://example.com',
        referrerUrl: 'https://referrer.com',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        screenWidth: 1920,
        screenHeight: 1080,
        connection: {
          effectiveType: '4g',
          downlink: 10,
          rtt: 50,
        }
      }
    };
    
    const db = DB.connect();
    await new PageViewEvent(exampleData, db).createPageView();
    await new PageViewEvent(exampleData, db).createPageView();
    const allPageViews = await db.client`SELECT * FROM page_views`;
  
    expect(allPageViews).toHaveLength(1);
    expect(allPageViews[0].uuid).toEqual(exampleData.uuid);
    expect(allPageViews[0].project_key).toEqual(exampleData.projectKey);
    expect(allPageViews[0].full_url).toEqual(exampleData.data.url);
    expect(allPageViews[0].url_path).toEqual(new URL(exampleData.data.url).pathname);
    expect(allPageViews[0].url_host).toEqual(new URL(exampleData.data.url).hostname);
    expect(allPageViews[0].referrer_full_url).toEqual(exampleData.data.referrerUrl);
    expect(allPageViews[0].referrer_url_path).toEqual(new URL(exampleData.data.referrerUrl).pathname);
    expect(allPageViews[0].referrer_url_host).toEqual(new URL(exampleData.data.referrerUrl).hostname);
    expect(allPageViews[0].user_agent).toEqual(exampleData.data.userAgent);
    expect(allPageViews[0].screen_width).toEqual(exampleData.data.screenWidth.toString());
    expect(allPageViews[0].screen_height).toEqual(exampleData.data.screenHeight.toString());
    expect(allPageViews[0].connection_effective_type).toEqual(exampleData.data.connection.effectiveType);
    expect(allPageViews[0].connection_downlink).toEqual(exampleData.data.connection.downlink.toString());
    expect(allPageViews[0].connection_rtt).toEqual(exampleData.data.connection.rtt.toString());
    expect(allPageViews[0].navigation_type).toEqual(exampleData.data.navigationType);
    expect(allPageViews[0].page_view_ts).toEqual(new Date(exampleData.data.pageLoadTs));
  });
})