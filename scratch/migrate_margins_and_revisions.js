const { createClient } = require('@libsql/client');
const crypto = require('crypto');
const path = require('path');

const dbPath = path.join(process.cwd(), 'kandhan_dev.db');
const client = createClient({ url: `file:${dbPath}` });

async function migrate() {
  console.log('Migrating quotation margin & revision tracking columns...');

  // 1. Alter quotation_revisions
  const revCols = [
    `ALTER TABLE quotation_revisions ADD COLUMN total_cost REAL DEFAULT 0;`,
    `ALTER TABLE quotation_revisions ADD COLUMN total_margin REAL DEFAULT 0;`,
    `ALTER TABLE quotation_revisions ADD COLUMN overall_margin_percent REAL DEFAULT 0;`,
    `ALTER TABLE quotation_revisions ADD COLUMN negotiation_notes TEXT;`,
  ];

  for (const sql of revCols) {
    try {
      await client.execute(sql);
      console.log('Executed:', sql);
    } catch (e) {
      // Column may already exist
      console.log('Note:', e.message);
    }
  }

  // 2. Alter quotation_items
  const itemCols = [
    `ALTER TABLE quotation_items ADD COLUMN cost_rate REAL DEFAULT 0;`,
    `ALTER TABLE quotation_items ADD COLUMN margin_percent REAL DEFAULT 0;`,
  ];

  for (const sql of itemCols) {
    try {
      await client.execute(sql);
      console.log('Executed:', sql);
    } catch (e) {
      console.log('Note:', e.message);
    }
  }

  // 3. Fix orphaned confirmed quotations without Work Orders
  console.log('Checking confirmed quotations missing work orders...');
  const quotes = await client.execute(`
    SELECT q.id, q.quote_number, q.client_id, q.enquiry_id, q.current_revision
    FROM quotations q
    WHERE q.status = 'CONFIRMED'
    AND q.id NOT IN (SELECT quotation_id FROM order_confirmations);
  `);

  console.log(`Found ${quotes.rows.length} confirmed quotes missing work orders.`);

  for (const q of quotes.rows) {
    // Get active revision
    const revRes = await client.execute({
      sql: `SELECT id, grand_total, terms_and_conditions, bank_account_id FROM quotation_revisions WHERE quotation_id = ? AND revision_number = ? LIMIT 1;`,
      args: [q.id, q.current_revision],
    });

    const activeRev = revRes.rows[0];
    if (activeRev) {
      const year = new Date().getFullYear();
      const countRes = await client.execute(`SELECT COUNT(*) as c FROM order_confirmations;`);
      const nextSeq = String((Number(countRes.rows[0].c) || 0) + 1).padStart(3, '0');
      const orderNumber = `KG-WO-${year}-${nextSeq}`;
      const orderId = 'wo_' + crypto.randomUUID().slice(0, 8);
      const grandTotal = Number(activeRev.grand_total) || 0;
      const advanceAgreed = Math.round(grandTotal * 0.25); // 25% default advance

      await client.execute({
        sql: `
          INSERT INTO order_confirmations (
            id, order_number, enquiry_id, quotation_id, confirmed_revision_id,
            client_id, agreed_contract_value, advance_agreed, start_date,
            status, contract_terms, bank_account_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?);
        `,
        args: [
          orderId,
          orderNumber,
          q.enquiry_id || null,
          q.id,
          activeRev.id,
          q.client_id,
          grandTotal,
          advanceAgreed,
          new Date().toISOString().split('T')[0],
          activeRev.terms_and_conditions || null,
          activeRev.bank_account_id || null,
        ],
      });

      console.log(`Successfully generated missing Work Order ${orderNumber} for Quote ${q.quote_number}!`);
    }
  }

  console.log('Migration and orphan fix complete.');
}

migrate()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  });

