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
      CAST(response_start AS int) > 0 AND
      created_at > '2023-03-20 00:00:00.000000+00'
    ORDER BY
      created_at DESC
  `;
  const navigationEntries = await client`
    SELECT
      *
    FROM
      navigation_performance_entries
    ORDER BY
      created_at DESC
  `;
  console.log(`Found ${resources.length} resources to update`);
  console.log(`Found ${navigationEntries.length} navigation resources to update`);
  let i = 0;
  for (const resource of resources) {
    try {
      const { uuid } = resource;
      const { 
        waiting_duration, 
        redirect_duration, 
        dns_lookup_duration, 
        tcp_duration, 
        ssl_duration, 
        request_duration, 
        response_duration 
      } = getCalculatedDurationsForResource(resource);
      await client`
        UPDATE 
          resource_performance_entries 
        SET 
          waiting_duration = ${waiting_duration}, 
          redirect_duration = ${redirect_duration}, 
          dns_lookup_duration = ${dns_lookup_duration},
          tcp_duration = ${tcp_duration},
          ssl_duration = ${ssl_duration},
          request_duration = ${request_duration},
          response_duration = ${response_duration}
        WHERE 
          uuid = ${uuid}
      `;
      i += 1;
      // console.log(`waiting_duration = ${waiting_duration}, redirect_duration = ${redirect_duration}, dns_lookup_duration = ${dns_lookup_duration}, tcp_duration = ${tcp_duration}, ssl_duration = ${ssl_duration}, request_duration = ${request_duration}, response_duration = ${response_duration}`)
      console.log(`Updated ${resource.name}`);
      console.log(`${(i/(resources.length + navigationEntries.length)) * 100}% (${i}/${resources.length + navigationEntries.length})\n`);
    } catch (err) {
      console.error(`Failed to update ${resource.name}`, err);
    }
  };

  for (const resource of navigationEntries) {
    try {
      const { uuid } = resource;
      const {
        waiting_duration,
        redirect_duration,
        dns_lookup_duration,
        tcp_duration,
        ssl_duration,
        request_duration,
        response_duration
      } = getCalculatedDurationsForResource(resource);
      if (typeof request_duration === 'number') {
        await client`
          UPDATE 
            navigation_performance_entries 
          SET 
            waiting_duration = ${waiting_duration}, 
            redirect_duration = ${redirect_duration}, 
            dns_lookup_duration = ${dns_lookup_duration},
            tcp_duration = ${tcp_duration},
            ssl_duration = ${ssl_duration},
            request_duration = ${request_duration},
            response_duration = ${response_duration}
          WHERE 
            uuid = ${uuid}
        `;
        i += 1;
        // console.log(`waiting_duration = ${waiting_duration}, redirect_duration = ${redirect_duration}, dns_lookup_duration = ${dns_lookup_duration}, tcp_duration = ${tcp_duration}, ssl_duration = ${ssl_duration}, request_duration = ${request_duration}, response_duration = ${response_duration}`)
        console.log(`Updated ${resource.name}`);
        console.log(`${(i / (resources.length + navigationEntries.length)) * 100}% (${i}/${resources.length + navigationEntries.length})\n`);
      }
    } catch (err) {
      console.error(`Failed to update ${resource.name}`, err);
    }
  };

  console.log('done')
  process.exit(0);
}

function getCalculatedDurationsForResource(resource) {
  if (!resource.fetch_start) return {};
  const redirect_duration = parseFloat(resource.redirect_end) - parseFloat(resource.redirect_start);
  const dns_lookup_duration = parseFloat(resource.domain_lookup_end) - parseFloat(resource.domain_lookup_start);
  const tcp_duration = (parseFloat(resource.secure_connection_start) || parseFloat(resource.connect_start)) - parseFloat(resource.connect_start);
  // TODO: need to redo migration with correct connect_end timestamp :/
  // const ssl_duration = parseFloat(resource.request_start) - parseFloat(resource.secure_connection_start);
  const ssl_duration = parseFloat(resource.connect_end) - (parseFloat(resource.secure_connection_start) || parseFloat(resource.connect_start));
  const request_duration = parseFloat(resource.response_start) - parseFloat(resource.request_start);
  const response_duration = parseFloat(resource.response_end) - parseFloat(resource.response_start);

  const firstTime = dns_lookup_duration > 0
    ? parseFloat(resource.domain_lookup_start || 0)
    : tcp_duration > 0
      ? parseFloat(resource.connect_start || 0) || parseFloat(resource.secure_connection_start || 0)
      : ssl_duration > 0
        ? parseFloat(resource.connect_end || 0)
        : parseFloat(resource.request_start || 0) || parseFloat(resource.fetch_start || 0);
  const waiting_duration = firstTime - parseFloat(resource.fetch_start);
  return {
    waiting_duration, redirect_duration, dns_lookup_duration, tcp_duration, ssl_duration, request_duration, response_duration
  }
}
