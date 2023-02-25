const { SwishJam } = require('../src/swishjam');

describe('init', () => {
  it('throws an error if the config is missing the reportingUrl', () => {
    expect(() => SwishJam.init({ publicApiKey: 'foo123' })).toThrow('Swishjam `reportingUrl` is required');
  });

  it('throws an error if the config is missing the reportingUrl', () => {
    expect(() => SwishJam.init({ reportingUrl: 'baz789' })).toThrow('Swishjam `publicApiKey` is required');
  });

  // it('initializes Swishjam with default config', () => {
  //   SwishJam.init();
  //   expect(window.Swishjam.config).toEqual({
  //     sampleRate: 1.0,
  //     reportingUrl: 'https://api.swishjam.com/v1/events',
  //     publicApiKey: undefined,
  //     maxNumEventsInMemory: 15,
  //     reportAfterIdleTimeMs: 10000,
  //     reportingIdleTimeCheckInterval: 2000,
  //     mockApiCalls: false,
  //     performanceEntryTypesToCapture: ['navigation', 'paint', 'resource', 'longtask', 'largest-contentful-paint', 'layout-shift'],
  //     includeSwishjamResourcesEntries: false,
  //     disablePerformanceEntriesCapture: false,
  //   });
  // });
});