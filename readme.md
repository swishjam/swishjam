![Swishjam Performance Monitoring Instrumentation](/readme.png)

<div align="center"> <strong>Swishjam</strong></div>
<div align="center">Dead Simple Open-Source Performance Tools</div>
<br />
<div align="center">
<a href="https://tagsafe.io">Website</a> 
<span> · </span>
<a href="https://github.com/swishjam/swishjam">GitHub</a> 
</div>

## Swishjam is a open-source toolset for people who care about beautiful web experiences.  
- Light-weight javascript capture of core web vitals, page load waterfalls, & more
- [Coming soon] Combine CrUX (Chrome UX Report) & you real user data to see page performance
- [Coming soon] Page loading optimization script baked in
- [Coming soon] Notifications & regression monitors 
- Drop us a message to dsicuss upcoming features 


## Our goal
We want everyone to build awesome web experiences. We see Swishjam becoming a collection of tools to measure, mitigate, and enhance your users experience and help it perform better.


## Repo Architecture 
    .
    ├── api                   # AWS Configurations & Data handling pipline for scalable data ingest
    ├── database              # Manages the RDS data structure using Node.js & Sequelize
    ├── instrumentation       # Instrumentation code to capture performance data
    ├── dashboard             # [Coming soon] Visualize your user's experiences better
    ├── LICENSE
    └── README.md

### Setup 
Each folder: api, database, instrumentation, and dashboard [coming soon] will have it's own installation instructions. Please read the installation in each folder to get you started. We recommend setup in the following order:

1. Instrumentation
2. Database
3. API
3. Dashboard

## Contributing
- Send us a PR, github issue, or email at founders@tagsafe.io

## Authors
- Collin Schneider ([@CollinSchneid](https://twitter.com/collinschneid))
- Zach Zimbler ([@zzimbler](https://twitter.com/zzimbler))

## License

MIT License