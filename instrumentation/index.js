import {
  sampleRate,
  reportingUrl,
  publicApiKey,
  maxNumEventsInMemory,
  reportAfterIdleTimeMs,
  reportingIdleTimeCheckInterval,
  mockApiCalls,
  performanceEntryTypesToCapture,
  includeSwishjamResourcesEntries
} from './config';
import { Swishjam } from './src/swishjam';

Swishjam.init({
  sampleRate,
  reportingUrl,
  publicApiKey,
  maxNumEventsInMemory,
  reportAfterIdleTimeMs,
  reportingIdleTimeCheckInterval,
  mockApiCalls,
  performanceEntryTypesToCapture,
  includeSwishjamResourcesEntries
});


