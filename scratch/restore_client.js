const { createClient } = require('@libsql/client');
const client = createClient({ url: 'file:kandhan_dev.db' });

async function restore() {
  await client.execute({
    sql: `INSERT OR REPLACE INTO clients (id, name, phone, email, company_name, gstin, billing_address, site_address, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'cli_demo_01',
      'S. Murugan',
      '+91 98410 99887',
      'murugan.textiles@gmail.com',
      'Murugan Spinning Mills Pvt Ltd',
      '33AAACM1234F1Z9',
      '45, Industrial Estate, Coimbatore, Tamil Nadu',
      'Plot 12, SIPCOT Industrial Park, Perundurai',
      '2026-11-03 22:45:41'
    ]
  });
  console.log('Restored cli_demo_01');
  process.exit(0);
}
restore();

