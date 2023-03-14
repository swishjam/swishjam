const postgres = require('postgres');
require('dotenv').config();
const credentials = require(`${__dirname}/../credentials`)[process.env.NODE_ENV];

console.log(`Running data migration on ${process.env.NODE_ENV} environment...`);
const client = postgres({ ...credentials });

module.exports.run = async () => {
  console.log('running...')
  const resources = await client`SELECT * FROM resource_performance_entries WHERE name_to_url_host IS NULL`;
  for(const resource of resources) {
    try {
      const { name, uuid } = resource;
      const url = new URL(name);
      const { host, pathname, search } = url;
      console.log(`Setting resource ${name} to host ${host}, path ${pathname}, query ${search}`)
      await client`
        UPDATE 
          resource_performance_entries 
        SET 
          name_to_url_host = ${host}, 
          name_to_url_path = ${pathname}, 
          name_to_url_query = ${search} 
        WHERE 
          uuid = ${uuid}
      `;
    } catch(err) {
      console.error(`Failed to update ${resource.name}`, err);
    }
  };
  console.log('done')
  process.exit(0);
}
