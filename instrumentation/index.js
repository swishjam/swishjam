import {
  sampleRate,
  reportingUrl,
  publicApiKey,
  maxNumEventsInMemory,
  reportAfterIdleTimeMs,
  reportingIdleTimeCheckInterval,
  mockApiCalls,
  performanceEntryTypesToCapture,
  includeSwishJamResourcesEntries
} from './config';
import { SwishJam } from './src/swishjam';

SwishJam.init({
  sampleRate,
  reportingUrl,
  publicApiKey,
  maxNumEventsInMemory,
  reportAfterIdleTimeMs,
  reportingIdleTimeCheckInterval,
  mockApiCalls,
  performanceEntryTypesToCapture,
  includeSwishJamResourcesEntries
});


