![Swishjam]()

<div align="center"><strong>Swishjam</strong></div>
<div align="center">The next generation of web performance tooling. <br />Performance monitoring owned by you.</div>
<br />
<div align="center">
<a href="https://useswishjam.com">Website</a> 
<span> · </span>
<a href="https://github.com/swishjam/swishjam">GitHub</a> 
</div>

## Introduction

This is a simple, light-weight monitoring solution to monitor your user's live experience. Our goal is to build a tiny, performant, tool to capture all of the performance data you could possibly want or need to make your site faster.  

## Why

We believe that a more performant web makes it more accessible to everyone in the world on any connection type. We think it's time to build a new era of performance tooling that is developer first, perfromant, and open source.

## Installation

Install from your command line.
```sh
npm install @swishjam/swishjam
```
## Initialize Swishjam

```js
import { Swishjam } from '@swishjam/swishjam'

Swishjam.init({
  reportingUrl: 'https://yourwebsite.com/api/swishjam-consumer',
  publicApiKey: 'some-unique-identifier' // this associates your event data with the environment
})
```

* **Node v16 or higher is required**

```sh
git clone git@github.com:swishjam/swishjam.git 

cd swishjam
```
### Setup the Instrumentation
```sh
cd instrumentation
npm install
```

## Getting started
--

## Components
--

## Integrations
--

## Browser Support

Instrumentation has been tested on the following popular browsers.

| <img src="https://react.email/static/icons/gmail.svg" width="48px" height="48px" alt="Gmail logo"> | <img src="https://react.email/static/icons/apple-mail.svg" width="48px" height="48px" alt="Apple Mail"> | <img src="https://react.email/static/icons/outlook.svg" width="48px" height="48px" alt="Outlook logo"> | <img src="https://react.email/static/icons/yahoo-mail.svg" width="48px" height="48px" alt="Yahoo! Mail logo"> | <img src="https://react.email/static/icons/hey.svg" width="48px" height="48px" alt="HEY logo"> | <img src="https://react.email/static/icons/superhuman.svg" width="48px" height="48px" alt="Superhuman logo"> |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |

## Development

#### Install dependencies

```sh
yarn install
```

#### Build and run packages
- 

## Contributing
- Send us a PR, github issue, or email at founders@tagsafe.io

## Authors
- Collin Schneider ([@CollinSchneid](https://twitter.com/collinschneid))
- Zach Zimbler ([@zzimbler](https://twitter.com/zzimbler))

## License

MIT License