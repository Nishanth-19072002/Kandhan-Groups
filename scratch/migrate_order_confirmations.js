const { createClient } = require('@libsql/client');
const client = createClient({ url: 'file:kandhan_dev.db' });

async function migrate() {
  await client.execute("PRAGMA foreign_keys = OFF;");
  await client.execute("DROP TABLE IF EXISTS `order_confirmations_old`;");
  await client.execute("ALTER TABLE `order_confirmations` RENAME TO `order_confirmations_old`;");

  await client.execute(`
    CREATE TABLE \`order_confirmations\` (
      \`id\` text PRIMARY KEY NOT NULL,
      \`order_number\` text NOT NULL UNIQUE,
      \`enquiry_id\` text,
      \`quotation_id\` text NOT NULL,
      \`confirmed_revision_id\` text NOT NULL,
      \`client_id\` text NOT NULL,
      \`client_po_reference\` text,
      \`signed_contract_url\` text,
      \`agreed_contract_value\` real NOT NULL,
      \`advance_agreed\` real NOT NULL,
      \`start_date\` text NOT NULL,
      \`expected_completion_date\` text,
      \`assigned_engineer_id\` text,
      \`status\` text DEFAULT 'ACTIVE' NOT NULL,
      \`created_at\` text DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (\`enquiry_id\`) REFERENCES \`enquiries\`(\`id\`) ON UPDATE no action ON DELETE set null,
      FOREIGN KEY (\`quotation_id\`) REFERENCES \`quotations\`(\`id\`) ON UPDATE no action ON DELETE no action,
      FOREIGN KEY (\`confirmed_revision_id\`) REFERENCES \`quotation_revisions\`(\`id\`) ON UPDATE no action ON DELETE no action,
      FOREIGN KEY (\`client_id\`) REFERENCES \`clients\`(\`id\`) ON UPDATE no action ON DELETE no action,
      FOREIGN KEY (\`assigned_engineer_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE no action
    );
  `);

  await client.execute(`
    INSERT INTO \`order_confirmations\` 
    SELECT * FROM \`order_confirmations_old\`;
  `);

  await client.execute("DROP TABLE \`order_confirmations_old\`;");
  await client.execute("PRAGMA foreign_keys = ON;");

  console.log("Migration complete: order_confirmations.enquiry_id is now nullable.");
  process.exit(0);
}

migrate().catch(e => {
  console.error(e);
  process.exit(1);
});

