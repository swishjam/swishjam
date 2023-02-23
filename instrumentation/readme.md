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
  reportingUrl: 'https://yourwebsite.com/api/swishjam-consumer',
  publicApiKey: 'some-unique-identifier' // this associates your event data with the environment
})
```
### Installing the backend
```sh
git clone git@github.com:swishjam/swishjam.git 
cd swishjam
```
* **Node v16 or higher is required**
### Setup the Instrumentation
```sh
cd instrumentation
npm install
```


## Contributing
- Send us a PR, github issue, or email at founders@tagsafe.io

## Authors
- Collin Schneider ([@CollinSchneid](https://twitter.com/collinschneid))
- Zach Zimbler ([@zzimbler](https://twitter.com/zzimbler))

## License
ISC License