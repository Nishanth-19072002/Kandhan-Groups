const { createClient } = require('@libsql/client');
const client = createClient({ url: 'file:kandhan_dev.db' });

async function dumpCounts() {
  const tables = ['clients', 'enquiries', 'followups', 'quotations', 'quotation_revisions', 'quotation_items', 'order_confirmations', 'sales_invoices', 'invoice_payments', 'vendors', 'purchase_bills', 'users'];
  for (const t of tables) {
    const res = await client.execute(`SELECT count(*) as c FROM ${t}`);
    console.log(`${t}: ${res.rows[0].c}`);
  }
  process.exit(0);
}
dumpCounts();

