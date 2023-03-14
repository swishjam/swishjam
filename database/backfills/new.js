const fs = require('fs');

const name = process.argv[2];
if(!name) throw new Error(`Missing backfill name argument. Please provide an argument for the name of the backfill like \`node new.js my-backfill\``);

const backfillFile = `/${Date.now()}-${name}.js`;
// fs.writeFileSync(backfillFile);

fs.writeFile(`${__dirname}/${backfillFile}`, '', (err) => {
  if (err) throw err;
});

console.log(`Created new backfill file: ${backfillFile}`);