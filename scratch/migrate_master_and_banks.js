const { createClient } = require('@libsql/client');
const client = createClient({ url: 'file:kandhan_dev.db' });

async function migrate() {
  console.log("Running migration for Master Items and Bank Accounts...");

  // 1. Create company_bank_accounts table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS company_bank_accounts (
      id TEXT PRIMARY KEY,
      account_nickname TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      account_holder_name TEXT NOT NULL DEFAULT 'Kandhan Groups',
      account_number TEXT NOT NULL,
      ifsc_code TEXT NOT NULL,
      branch TEXT,
      upi_id TEXT,
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Create master_items table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS master_items (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      item_name TEXT NOT NULL,
      description TEXT NOT NULL,
      unit TEXT NOT NULL,
      standard_rate REAL NOT NULL DEFAULT 0,
      hsn_sac_code TEXT DEFAULT '9954',
      is_custom INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Add column bank_account_id to quotation_revisions if not exists
  try {
    await client.execute(`ALTER TABLE quotation_revisions ADD COLUMN bank_account_id TEXT;`);
    console.log("Added bank_account_id to quotation_revisions");
  } catch (e) {
    console.log("bank_account_id already exists in quotation_revisions or skipped");
  }

  // 4. Add columns contract_terms and bank_account_id to order_confirmations if not exists
  try {
    await client.execute(`ALTER TABLE order_confirmations ADD COLUMN contract_terms TEXT;`);
    console.log("Added contract_terms to order_confirmations");
  } catch (e) {
    console.log("contract_terms already exists in order_confirmations or skipped");
  }

  try {
    await client.execute(`ALTER TABLE order_confirmations ADD COLUMN bank_account_id TEXT;`);
    console.log("Added bank_account_id to order_confirmations");
  } catch (e) {
    console.log("bank_account_id already exists in order_confirmations or skipped");
  }

  // 5. Seed default company bank accounts if empty
  const bankCheck = await client.execute(`SELECT count(*) as count FROM company_bank_accounts;`);
  if (bankCheck.rows[0].count === 0) {
    console.log("Seeding initial company bank accounts...");
    await client.execute({
      sql: `INSERT INTO company_bank_accounts (id, account_nickname, bank_name, account_holder_name, account_number, ifsc_code, branch, upi_id, is_default)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: ['bnk_hdfc_01', 'HDFC Bank — Main Operating A/C', 'HDFC Bank Ltd', 'Kandhan Groups', '50200088991122', 'HDFC0001420', 'Perundurai Main Branch', 'kandhangroups@hdfcbank', 1]
    });
    await client.execute({
      sql: `INSERT INTO company_bank_accounts (id, account_nickname, bank_name, account_holder_name, account_number, ifsc_code, branch, upi_id, is_default)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: ['bnk_icici_02', 'ICICI Bank — Project Escrow A/C', 'ICICI Bank Ltd', 'Kandhan Groups', '001205012345', 'ICIC0000012', 'Erode Central Branch', 'kandhanpmc@icici', 0]
    });
    await client.execute({
      sql: `INSERT INTO company_bank_accounts (id, account_nickname, bank_name, account_holder_name, account_number, ifsc_code, branch, upi_id, is_default)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: ['bnk_sbi_03', 'State Bank of India — Current A/C', 'State Bank of India', 'Kandhan Groups', '38992200112', 'SBIN0000832', 'Coimbatore Main Branch', 'kandhangroups@sbi', 0]
    });
    console.log("Bank accounts seeded successfully.");
  }

  // 6. Seed master items catalog if empty
  const itemCheck = await client.execute(`SELECT count(*) as count FROM master_items;`);
  if (itemCheck.rows[0].count === 0) {
    console.log("Seeding Master BOQ & Labor catalog...");
    const standardCatalog = [
      {
        id: 'mi_01',
        category: 'Civil & Earthworks',
        itemName: 'Machine Excavation in Soil & Soft Rock',
        description: 'Excavation in foundation trenches, pits, and basement with mechanical excavator including lift, ramming, and leveling.',
        unit: 'cu.ft',
        standardRate: 18,
        hsnSacCode: '9954'
      },
      {
        id: 'mi_02',
        category: 'Civil & Earthworks',
        itemName: 'PCC 1:4:8 Bed Concrete',
        description: 'Plain Cement Concrete 1:4:8 (1 cement : 4 coarse sand : 8 graded 40mm stone aggregate) leveling course under footings.',
        unit: 'sq.ft',
        standardRate: 180,
        hsnSacCode: '9954'
      },
      {
        id: 'mi_03',
        category: 'RCC & Structural',
        itemName: 'M25 Reinforced Cement Concrete',
        description: 'Design mix M25 grade RCC casting for column footings, grade beams, roof beams, and floor slabs with mechanical compaction.',
        unit: 'sq.ft',
        standardRate: 460,
        hsnSacCode: '9954'
      },
      {
        id: 'mi_04',
        category: 'RCC & Structural',
        itemName: 'Fe-550D TMT Reinforcement Steel',
        description: 'Supplying, cutting, bending, fabricating, and placing primary steel reinforcement including binding wire & cover blocks.',
        unit: 'tons',
        standardRate: 72000,
        hsnSacCode: '9954'
      },
      {
        id: 'mi_05',
        category: 'Masonry & Plastering',
        itemName: '200mm AAC Block Masonry',
        description: 'Autoclaved Aerated Concrete (AAC) 200mm block wall construction using polymer-modified jointing adhesive with neat joints.',
        unit: 'sq.ft',
        standardRate: 165,
        hsnSacCode: '9954'
      },
      {
        id: 'mi_06',
        category: 'Masonry & Plastering',
        itemName: '9" First Class Red Brick Masonry',
        description: 'First quality country red brick masonry in cement mortar 1:6 including racking out joints and daily curing.',
        unit: 'sq.ft',
        standardRate: 185,
        hsnSacCode: '9954'
      },
      {
        id: 'mi_07',
        category: 'Masonry & Plastering',
        itemName: 'Internal 12mm Smooth Plastering',
        description: '12mm cement plastering in cement mortar 1:4 with smooth neeru finish ready for paint priming.',
        unit: 'sq.ft',
        standardRate: 38,
        hsnSacCode: '9954'
      },
      {
        id: 'mi_08',
        category: 'Masonry & Plastering',
        itemName: 'External 20mm Waterproof Plastering',
        description: '20mm double coat cement plaster in 1:4 mix with Dr. Fixit waterproofing additive and sponge texture finish.',
        unit: 'sq.ft',
        standardRate: 52,
        hsnSacCode: '9954'
      },
      {
        id: 'mi_09',
        category: 'Flooring & Tremix',
        itemName: '150mm VDF Tremix Industrial Flooring',
        description: 'Vacuum Dewatered Concrete (VDF) 150mm thick with M25 concrete, groove cutting, and metallic floor hardener power troweling.',
        unit: 'sq.ft',
        standardRate: 145,
        hsnSacCode: '9954'
      },
      {
        id: 'mi_10',
        category: 'Flooring & Tremix',
        itemName: '600x600mm Vitrified Tile Flooring',
        description: 'Laying double charged vitrified floor tiles with cement mortar bedding, epoxy grouting, and 100mm border skirting.',
        unit: 'sq.ft',
        standardRate: 85,
        hsnSacCode: '9954'
      },
      {
        id: 'mi_11',
        category: 'Fabrication & PEB Shed',
        itemName: 'Structural Steel Portal Frame & PEB Rafters',
        description: 'Fabrication, sand blasting, epoxy primer coating, transport, and site erection of industrial shed structural steel members.',
        unit: 'tons',
        standardRate: 85000,
        hsnSacCode: '9954'
      },
      {
        id: 'mi_12',
        category: 'Fabrication & PEB Shed',
        itemName: '0.50mm Galvalume Color-Coated Roof Sheets',
        description: 'Fixing 0.50mm profile Galvalume sheets with self-drilling fasteners, EPDM washers, and ridge capping.',
        unit: 'sq.ft',
        standardRate: 68,
        hsnSacCode: '9954'
      },
      // Labor & Manpower standard items:
      {
        id: 'mi_13',
        category: 'Labor & Manpower',
        itemName: 'Head Mason / Site Foreman',
        description: 'Senior experienced civil construction supervisor / head master mason for structural alignment & quality control.',
        unit: 'days',
        standardRate: 1200,
        hsnSacCode: '9954'
      },
      {
        id: 'mi_14',
        category: 'Labor & Manpower',
        itemName: 'Mason (Grade-1 Skilled)',
        description: 'Skilled bricklayer / plasterer / concrete finisher with standard masonry tools.',
        unit: 'days',
        standardRate: 950,
        hsnSacCode: '9954'
      },
      {
        id: 'mi_15',
        category: 'Labor & Manpower',
        itemName: 'Painter (Skilled Architectural)',
        description: 'Skilled wall painter for putty application, primer, and double-coat emulsion / weather coat finish.',
        unit: 'days',
        standardRate: 850,
        hsnSacCode: '9954'
      },
      {
        id: 'mi_16',
        category: 'Labor & Manpower',
        itemName: 'Steel Barbender / Fabricator',
        description: 'Skilled reinforcement bar binder and structural steel fitter.',
        unit: 'days',
        standardRate: 950,
        hsnSacCode: '9954'
      },
      {
        id: 'mi_17',
        category: 'Labor & Manpower',
        itemName: 'Certified Welder (MIG/ARC)',
        description: 'Certified welder for structural steel factory trusses, purlins, and heavy joint welding.',
        unit: 'days',
        standardRate: 1050,
        hsnSacCode: '9954'
      },
      {
        id: 'mi_18',
        category: 'Labor & Manpower',
        itemName: 'Electrician (Wiring & Conduit)',
        description: 'Licensed industrial / commercial electrician for slab conduit laying and distribution board connection.',
        unit: 'days',
        standardRate: 900,
        hsnSacCode: '9954'
      },
      {
        id: 'mi_19',
        category: 'Labor & Manpower',
        itemName: 'Plumber & Pipefitter',
        description: 'Skilled plumber for drainage, CPVC water supply lines, and sanitary fixture installation.',
        unit: 'days',
        standardRate: 900,
        hsnSacCode: '9954'
      },
      {
        id: 'mi_20',
        category: 'Labor & Manpower',
        itemName: 'Unskilled Helper / Laborer',
        description: 'General construction helper for concrete carriage, material shifting, curing, and excavation assistance.',
        unit: 'days',
        standardRate: 650,
        hsnSacCode: '9954'
      }
    ];

    for (const item of standardCatalog) {
      await client.execute({
        sql: `INSERT INTO master_items (id, category, item_name, description, unit, standard_rate, hsn_sac_code, is_custom)
              VALUES (?, ?, ?, ?, ?, ?, ?, 0);`,
        args: [item.id, item.category, item.itemName, item.description, item.unit, item.standardRate, item.hsnSacCode]
      });
    }
    console.log(`Seeded ${standardCatalog.length} master BOQ & labor items.`);
  }

  console.log("Migration completed successfully!");
}

migrate().catch(console.error);

