const { createClient } = require('@libsql/client');
const client = createClient({ url: 'file:kandhan_dev.db' });

async function main() {
  const r = await client.execute("SELECT sql FROM sqlite_master WHERE name = 'order_confirmations'");
  console.log('DDL:\n', r.rows[0].sql);
  process.exit(0);
}

main();

