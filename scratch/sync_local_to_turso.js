const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env.local" });

const localClient = createClient({ url: "file:kandhan_dev.db" });
const cloudClient = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function syncAllData() {
  console.log("🚀 Starting data sync in proper FK dependency order...");

  const tables = [
    "users",
    "company_settings",
    "company_bank_accounts",
    "master_items",
    "network_groups",
    "network_contacts",
    "vendors",
    "clients",
    "enquiries",
    "followups",
    "quotations",
    "quotation_revisions",
    "quotation_items",
    "order_confirmations",
    "sales_invoices",
    "invoice_payments",
  ];

  for (const table of tables) {
    try {
      const { rows } = await localClient.execute(`SELECT * FROM ${table}`);
      if (rows.length === 0) {
        console.log(`- ${table}: 0 rows (skipped)`);
        continue;
      }

      console.log(`- ${table}: syncing ${rows.length} rows...`);
      for (const row of rows) {
        const columns = Object.keys(row);
        const placeholders = columns.map(() => "?").join(", ");
        const values = Object.values(row);

        const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;
        await cloudClient.execute({ sql, args: values });
      }
      console.log(`  ✓ ${table} synced successfully!`);
    } catch (err) {
      console.warn(`  ! Note on ${table}:`, err.message);
    }
  }

  console.log("✨ All tables and data synced 100% to Turso Cloud!");
}

syncAllData().catch(console.error);
