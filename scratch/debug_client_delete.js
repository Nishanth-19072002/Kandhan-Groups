const { createClient } = require('@libsql/client');
const client = createClient({ url: 'file:kandhan_dev.db' });

async function debugDelete() {
  const id = 'cli_demo_01';
  // Let's check all foreign keys in the whole database pointing to clients!
  const foreignKeys = await client.execute(`
    SELECT m.name as table_name, p.*
    FROM sqlite_master m
    JOIN pragma_foreign_key_list(m.name) p
    WHERE m.type = 'table' AND p."table" = 'clients'
  `);
  console.log('Tables referencing clients:', foreignKeys.rows);

  for (const row of foreignKeys.rows) {
    const count = await client.execute(`SELECT count(*) as c FROM ${row.table_name} WHERE ${row.from} = '${id}'`);
    console.log(`Table ${row.table_name}.${row.from} has count:`, count.rows[0].c);
  }
  process.exit(0);
}

debugDelete();

