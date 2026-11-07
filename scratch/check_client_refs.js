const { createClient } = require('@libsql/client');
const client = createClient({ url: 'file:kandhan_dev.db' });

async function check() {
  const tables = (await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")).rows;
  for (const t of tables) {
    try {
      const res = await client.execute(`SELECT count(*) as c FROM ${t.name} WHERE client_id = 'cli_demo_01'`);
      if (res.rows[0].c > 0) {
        console.log('Found in table:', t.name, 'count:', res.rows[0].c);
      }
    } catch(e) {
      // no client_id column
    }
  }
  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });

