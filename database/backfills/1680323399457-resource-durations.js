const postgres = require('postgres');
require('dotenv').config();
const credentials = require(`${__dirname}/../credentials`)[process.env.NODE_ENV];

console.log(`Running data migration on ${process.env.NODE_ENV} environment...`);
const client = postgres({ ...credentials });

module.exports.run = async () => {
  console.log('running...')
  const resources = await client`
    SELECT 
      * 
    FROM 
      resource_performance_entries 
    WHERE 
      request_duration IS NULL AND 
      CAST(response_start AS int) > 0`;
  console.log(`Found ${resources.length} resources to update`);
  let i = 0;
  for (const resource of resources) {
    try {
      const { uuid } = resource;
      const firstTime = parseFloat(resource.domain_lookup_start || resource.secure_connection_start || resource.request_start || resource.fetch_start);
      const waiting_duration = firstTime - parseFloat(resource.fetch_start);
      const redirect_duration = parseFloat(resource.redirect_end) - parseFloat(resource.redirect_start);
      const service_worker_duration = parseFloat(resource.response_end) - parseFloat(resource.worker_start || resource.response_end);
      const dns_lookup_duration = parseFloat(resource.domain_lookup_end) - parseFloat(resource.domain_lookup_start);
      const tcp_duration = parseFloat(resource.secure_connection_start) - parseFloat(resource.connect_start);
      const ssl_duration = parseFloat(resource.connect_end) - parseFloat(resource.secure_connection_start);
      const request_duration = parseFloat(resource.response_start) - parseFloat(resource.request_start);
      const response_duration = parseFloat(resource.response_end) - parseFloat(resource.response_start);
      await client`
        UPDATE 
          resource_performance_entries 
        SET 
          waiting_duration = ${waiting_duration}, 
          redirect_duration = ${redirect_duration}, 
          service_worker_duration = ${service_worker_duration},
          dns_lookup_duration = ${dns_lookup_duration},
          tcp_duration = ${tcp_duration},
          ssl_duration = ${ssl_duration},
          request_duration = ${request_duration},
          response_duration = ${response_duration}
        WHERE 
          uuid = ${uuid}
      `;
      i += 1;
      console.log(`waiting_duration = ${waiting_duration}, redirect_duration = ${redirect_duration}, service_worker_duration = ${service_worker_duration}, dns_lookup_duration = ${dns_lookup_duration}, tcp_duration = ${tcp_duration}, ssl_duration = ${ssl_duration}, request_duration = ${request_duration}, response_duration = ${response_duration}`)
      console.log(`Updated ${resource.name} (${i}/${resources.length})\n`);
    } catch (err) {
      console.error(`Failed to update ${resource.name}`, err);
    }
  };
  console.log('done')
  process.exit(0);
}
