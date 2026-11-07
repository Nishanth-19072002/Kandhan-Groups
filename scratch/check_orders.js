const { createClient } = require('@libsql/client');
const path = require('path');
const dbPath = path.join(process.cwd(), 'kandhan_dev.db');
const client = createClient({ url: `file:${dbPath}` });

async function check() {
  const quotes = await client.execute('SELECT id, quote_number, status FROM quotations;');
  console.log('QUOTES:', quotes.rows);
  const orders = await client.execute('SELECT id, order_number, quotation_id, client_id, agreed_contract_value FROM order_confirmations;');
  console.log('ORDERS:', orders.rows);
}
check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

