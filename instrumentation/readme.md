![Swishjam](https://useswishjam.com/readme.png)

<div align="center"><strong>Swishjam Instrumentation</strong></div>
<div align="center">Dead Simple Open-Source Performance Tools</div>
<br />
<div align="center">
<a href="https://useswishjam.com">Website</a> 
<span> · </span>
<a href="https://github.com/swishjam/swishjam">GitHub</a> 
</div>

## Swishjam Instrumentation
A Light-weight javascript tool to capture of core web vitals, page load waterfalls, & more.

### Installing with NPM
```sh
npm install @swishjam/swishjam
```
### Initialize Swishjam
```js
import { Swishjam } from '@swishjam/swishjam'
Swishjam.init({
  reportingUrl: 'https://example.com/api/swishjam-consumer', // Update to your consumer endpoint or one provided to you by useSwishjam.com
  publicApiKey: 'some-unique-identifier' // this associates your event data with the environment
})
```
### Full Config Settings 
```js
Swishjam.init({
  reportingUrl: 'https://yourwebsite.com/api/swishjam-consumer',
  publicApiKey: 'some-unique-identifier', // this associates your event data with the environment
  shouldCapturePerformanceEntries: true, // default is true
  performanceEntryTypesToCapture: ["paint", "longtask", "navigation", "resource", "largest-contentful-paint", "first-input", "layout-shift"], // default is full list
  mockApiCalls: false, // default false
  maxNumEventsInMemory: 25, // default 25
  reportAfterIdleTimeMs: 10_000, // default 10_000
  sampleRate: 1.0, // default 1.0
  includeSwishjamResourcesEntries: false // default false
})
```
## Contributing
```sh
git clone git@github.com:swishjam/swishjam.git 
cd swishjam
# For contributing to Swishjam instrumentation
cd instrumentation
npm install
# **Node v16 or higher is required**
```
- Send us a PR, github issue, or email at founders@tagsafe.io

## Authors
- Collin Schneider ([@CollinSchneid](https://twitter.com/collinschneid))
- Zach Zimbler ([@zzimbler](https://twitter.com/zzimbler))
## License
ISC License