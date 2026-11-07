const { createClient } = require('@libsql/client');
const client = createClient({ url: 'file:kandhan_dev.db' });

async function testDelete() {
  const id = 'cli_demo_01';
  try {
    const c = (await client.execute({ sql: "SELECT * FROM clients WHERE id = ?", args: [id] })).rows[0];
    console.log('Client to delete:', c);

    await client.execute({ sql: "DELETE FROM clients WHERE id = ?", args: [id] });
    console.log('Deleted successfully from sqlite!');
  } catch (err) {
    console.error('SQLite Delete error:', err);
  }
  process.exit(0);
}

testDelete();
