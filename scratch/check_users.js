const { createClient } = require('@libsql/client');
const client = createClient({ url: 'file:kandhan_dev.db' });

async function checkUser() {
  const users = await client.execute("SELECT id, name, email, role FROM users");
  console.log('Users in DB:', users.rows);
  process.exit(0);
}
checkUser();

