// const { SwishJam } = require('../src/swishjam');
import { Swishjam } from '../src/swishjam';

describe('init', () => {
  it('throws an error if the config is missing the reportingUrl', () => {
    expect(() => Swishjam.init({ publicApiKey: 'foo123' })).toThrow('Swishjam `reportingUrl` is required');
  });

  it('throws an error if the config is missing the reportingUrl', () => {
    expect(() => Swishjam.init({ reportingUrl: 'baz789' })).toThrow('Swishjam `publicApiKey` is required');
  });

  it('initializes Swishjam with default config', () => {
    Swishjam.init({
      reportingUrl: 'https://api.swishjam.com/v1/events',
      publicApiKey: 'foo123',
    });
    expect(window.Swishjam.config).toEqual({
      sampleRate: 1.0,
      reportingUrl: 'https://api.swishjam.com/v1/events',
      publicApiKey: 'foo123',
      maxNumEventsInMemory: 25,
      reportAfterIdleTimeMs: 10_000,
      reportingIdleTimeCheckInterval: 2_000,
      mockApiCalls: false,
      performanceEntryTypesToCapture: ['navigation', 'paint', 'resource', 'longtask', 'largest-contentful-paint', 'layout-shift'],
      includeSwishjamResourcesEntries: false,
      disablePerformanceEntriesCapture: false,
    });
  });
});