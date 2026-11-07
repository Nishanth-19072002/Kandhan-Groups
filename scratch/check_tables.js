const { createClient } = require('@libsql/client');
const client = createClient({ url: 'file:kandhan_dev.db' });

async function main() {
  const res = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log("Existing tables:", res.rows.map(r => r.name));
}

main().catch(console.error);

