![Swishjam Performance Monitoring Instrumentation](https://swishjam.com/readme.png)

<div align="center"> <strong>Swishjam</strong></div>
<div align="center">Build incredible customer experiences delivered at lightning speed.</div>
<br />
<div align="center">
<a href="https://swishjam.com">Website</a>
<span> · </span>
<a href="https://github.com/swishjam/swishjam">GitHub</a>
</div>

## Swishjam is a open-source toolset for people who care about beautiful web experiences.
- Real User Monitoring via Lightweight javascript capture of core web vitals, page load waterfalls, & more
- Lab tests to run Lighthouse tests
- CrUX data included. Pull data from CrUX to get the latest data from Google on your site performance.
- [Coming soon] Notifications, Alerts, Reporting 
- [Coming soon] Automatic page loading optimizations
- Drop us a message to discuss upcoming features

## Our goal
We want everyone to build awesome web experiences. We see Swishjam becoming a collection of tools to measure, monitor, and enhance your users experience and help it perform better.

## Repo Architecture 
    .
    ├── api                   # AWS Configurations & Data handling pipline for scalable data ingest
    ├── database              # Manages the RDS data structure using Node.js & Sequelize
    ├── instrumentation       # Instrumentation code to capture performance data
    ├── dashboard             # [Coming soon] Visualize your user's experiences better
    ├── LICENSE
    └── README.md

### Setup 
Each folder: api, database, instrumentation, and dashboard [coming soon] will have its own installation instructions. Please read the installation in each folder to get you started. We recommend setup in the following order:

1. Instrumentation
2. Database
3. API
3. Dashboard

### Adding Swishjam SDK
The `instrumentation` directory is what houses all of the Swishjam javascript that collects your web page's performance data and sends it to the API. In order to self-host Swishjam, you must host the Swishjam JS where your host the rest of your client-side JS. In order to do this, you must:

1. Run `npm install` within the `/instrumentation` directory.
2. Import the `Swishjam` object from the `src/swishjam` file (ie: `import { Swishjam } from './src/swishjam`).
3. Pass your `reportingUrl` and the `publicApiKey` arguments to the `Swishjam.init` method on page load. This will initialize Swishjam to begin collecting the performance data. 
- The `reportingUrl` is the API endpoint Swishjam will send data to (typically the API Gateway endpoint generated in the `/api` setup). 
- The `publicApiKey` is any unique indicator for your data that your dashboard will use to visualize your data. It is not as relavant for self-hosted Swishjam implementations, but it does allow for your to send data from multiple sites to the same Swishjam instance.
```js
Swishjam.init({
  reportingUrl: 'https://www.example.com/api/swishjam',
  publicApiKey: 'abc-789'
})
```

That's it. Swishjam JS will now collect and send performance data to your specific Reporting URL. Here are the other options available to you when calling the `Swishjam.init` method:
```js
Swishjam.init({
  reportingUrl, // The API endpoint Swishjam will send data to (typically the API Gateway endpoint generated in the `/api` setup)
  publicApiKey, // The unique indicator for your data that your dashboard will use to visualize your data
  sampleRate, // The rate in which Swishjam should collect data. 0.5 would mean 50% of page views are captured. The default is 1 (100%).
  maxNumEventsInMemory, // How many performance events Swishjam should hold in memory before sending the data to the Swishjam API endponit, flushing the data. The default is 25.
  reportAfterIdleTimeMs, // If the `maxNumEventsInMemory` has not been met, how long in ms to hold onto the data in memory before sending it to the Swishjam API endpoint and flushing the data. The default is 10,000.
  reportingIdleTimeCheckInterval, // The interval in ms to check the idle time reporting, the default is 2,000.
  mockApiCalls, // Disable API network calls and instead just console.log the data, useful for development. Should never be used in prod.
  performanceEntryTypesToCapture, // The type of performance entries (https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry/entryType) to capture and report on. The default is: 'navigation', 'paint', 'resource', 'longtask', 'largest-contentful-paint', 'layout-shift'. 
  includeSwishjamResourcesEntries, // Whether or not to report on Swishjam API calls as performance entries. The default is false.
  shouldCapturePerformanceEntries // Disable performance entry capture entirely, and only report Core Web Vital metrics.
})
```

### Testing Swishjam SDK Locally
1. In `/sdk/client/core` run `npm link`
2. In `/sdk/client/next-js` run `npm link @swishjam/core`
3. In `/sdk/client/next-js` run `npm link`
4. In your site report run `npm link @swishjam/next-js`, and you should now be able to make changes locally and test

### Database
The `database` directory is where your Postgres database is maintained. It uses Sequelize to run migrations against your DB. In order to get started you must:
1. Run `npm install` within the directory.
2. Update the `.env.sample` with your actual DB credentials and change the filename to `.env`
3. Run `npm run db:m` to migrate your database.

### API
The `api` directory is the ingestion layer of Swishjam that receives and processes all of the performance data collected by JS. It consists of: 
1. An AWS API Gateway endpoint that acts as the reporting endpoint instrumentation sends data to.
2. An AWS SQS queue that sits between the API Gateway and the Lambda function.
3. An AWS Lambda function that pulls messages from SQS, parses the data, and writes it to the Postgres DB.

The configuration is all maintained and built using an AWS CloudFormation template and the SAM framework to deploy it. In order to get started you must:
1. ([Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html))
2. Run `npm install` in the `/api` directory.
3. Run `npm run guided-deploy` to deploy the AWS services to your specified AWS account. 
- The CLI will prompt your for various configuration options (ie: Database host, Database username, etc...) required to run the AWS services. 
- Use the created API Gateway endpoint as your reporting URL in instrumentation.
4. The Swishjam Reporting API URL is outputted in the console. Use this value as the `reportingUrl` option in your `Swishjam.init` JS method.

### How to run in local development
- Turn on the dashboard in /dashboard run `npm run dev`
- Turn on the server, in /backend run `bundle exec rails s`
- Make sure Postgres turned on (We use macOS Postgres app that's always running)
- Turn on redis server, in /backend run `redis-server`
- Turn on the worker, in /backend run `bundle exec sidekiq`
- Turn on clickhouse, in /backend/clickhouse-server (or where you installed clickhouse) run `./clickhouse server`

## Contributing
- Send us a PR, github issue, or email at founders@tagsafe.io

## Authors
- Collin Schneider ([@CollinSchneid](https://twitter.com/collinschneid))
- Zach Zimbler ([@zzimbler](https://twitter.com/zzimbler))

## License

MIT License
