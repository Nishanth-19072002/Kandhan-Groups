const { createClient } = require('@libsql/client');
const crypto = require('crypto');
const path = require('path');

const dbPath = path.join(process.cwd(), 'kandhan_dev.db');
const client = createClient({ url: `file:${dbPath}` });

async function migrate() {
  console.log('Migrating network_groups and network_contacts tables in kandhan_dev.db...');

  // 1. Create network_groups table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS network_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Create network_contacts table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS network_contacts (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      firm_name TEXT,
      contact_person TEXT NOT NULL,
      phone TEXT NOT NULL,
      alternate_phone TEXT,
      email TEXT,
      city TEXT NOT NULL,
      area_locality TEXT,
      full_address TEXT,
      standard_rate TEXT,
      rate_unit TEXT,
      payment_terms TEXT,
      description TEXT,
      rating INTEGER DEFAULT 5,
      tier_level TEXT DEFAULT 'TIER_1',
      gstin TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES network_groups(id) ON DELETE CASCADE
    );
  `);

  console.log('Tables created successfully.');

  // 3. Seed standard groups if empty
  const existingGroups = await client.execute('SELECT COUNT(*) as count FROM network_groups;');
  if (existingGroups.rows[0].count === 0) {
    console.log('Seeding standard network groups...');

    const groups = [
      { id: 'grp_architects', name: 'Architects & Design Consultants', description: 'Architectural planning, 3D elevation, structural design, and statutory approvals' },
      { id: 'grp_cement', name: 'Cement Suppliers', description: 'OPC 53, PPC, UltraTech, Ramco, Dalmia, and RMC batching plants' },
      { id: 'grp_steel', name: 'TMT Steel & Reinforcement', description: 'Tata Tiscon, JSW, Fe550D primary steel rebar stockists and cut-and-bend yards' },
      { id: 'grp_hollow_blocks', name: 'Hollow Blocks', description: '6-inch, 8-inch, and 4-inch heavy duty concrete hollow & solid blocks' },
      { id: 'grp_bricks', name: 'Bricks & Wire-cut', description: 'Chamber burnt red bricks, wire-cut bricks, and clay masonry blocks' },
      { id: 'grp_excavation', name: 'Excavation & Earthmoving', description: 'JCB 3DX, Hitachi Poclain, rock breaking, and 10-wheel tipper earth removal' },
      { id: 'grp_door_frames', name: 'Door Frames & Joinery', description: 'Teak wood, Sal wood, country wood frames, UPVC and aluminium fabrication' },
      { id: 'grp_masons', name: 'Civil Masons & Maistries', description: 'Head masons, bricklayers, plastering squads, and centering shuttering labor' },
      { id: 'grp_painters', name: 'Painters & Surface Finishers', description: 'Exterior texture, interior putty, primer, emulsion, and protective industrial coating' },
      { id: 'grp_plumbing_electrical', name: 'Plumbing & Electrical', description: 'Licensed industrial electricians, plumbing squads, CPVC/UPVC pipe suppliers' },
    ];

    for (const g of groups) {
      await client.execute({
        sql: `INSERT INTO network_groups (id, name, description) VALUES (?, ?, ?);`,
        args: [g.id, g.name, g.description],
      });
    }

    // 4. Seed initial realistic contacts
    console.log('Seeding initial contacts...');

    const contacts = [
      // Architects
      {
        id: 'cnt_' + crypto.randomUUID().slice(0, 8),
        groupId: 'grp_architects',
        firmName: 'Studio V Architects & Associates',
        contactPerson: 'Ar. V. Karthikeyan',
        phone: '98421 55678',
        alternatePhone: '0424 2254321',
        email: 'karthik@studiovarch.com',
        city: 'Erode',
        areaLocality: 'Perundurai Road',
        fullAddress: '42, 2nd Floor, Sengunthar Nagar, Perundurai Road, Erode - 638011',
        standardRate: '₹35 / sq.ft',
        rateUnit: 'per sq.ft built-up area',
        paymentTerms: '20% advance, balance stage-wise',
        description: 'Specialists in industrial godown shed planning, factory layouts, and TN DTCP / LPA municipal plan sanctions',
        rating: 5,
        tierLevel: 'TIER_1',
      },
      {
        id: 'cnt_' + crypto.randomUUID().slice(0, 8),
        groupId: 'grp_architects',
        firmName: 'Apex Civil & Structural Consultants',
        contactPerson: 'Er. S. Manickam M.E.',
        phone: '94432 88990',
        city: 'Coimbatore',
        areaLocality: 'Gandhipuram',
        fullAddress: '15, Cross Cut Road, Gandhipuram, Coimbatore - 641012',
        standardRate: '₹12 / sq.ft',
        rateUnit: 'structural design & vetting',
        paymentTerms: '50% on preliminary design, 50% on final GFC drawings',
        description: 'StaadPro structural design vetting, soil bearing capacity reports, and PEB steel foundation calculations',
        rating: 5,
        tierLevel: 'TIER_1',
      },
      // Cement
      {
        id: 'cnt_' + crypto.randomUUID().slice(0, 8),
        groupId: 'grp_cement',
        firmName: 'Murugan Cements & Building Materials',
        contactPerson: 'P. Balasubramaniam',
        phone: '97880 12345',
        city: 'Perundurai',
        areaLocality: 'SIPCOT Industrial Area',
        fullAddress: 'Plot 45, SIPCOT Main Road, Perundurai - 638052',
        standardRate: '₹365 / bag',
        rateUnit: 'per 50kg bag',
        paymentTerms: '15 days credit on approved volume',
        description: 'Authorized UltraTech 53 Grade & Ramco Supercrete dealer. Immediate delivery with 10-wheel tipper unloading',
        rating: 5,
        tierLevel: 'TIER_1',
      },
      // Hollow Blocks
      {
        id: 'cnt_' + crypto.randomUUID().slice(0, 8),
        groupId: 'grp_hollow_blocks',
        firmName: 'Kaveri Hollow & Solid Blocks Factory',
        contactPerson: 'K. Velusamy',
        phone: '94862 33441',
        city: 'Perundurai',
        areaLocality: 'Kunnathur Road',
        fullAddress: 'SF 128, Kunnathur Road, Perundurai - 638052',
        standardRate: '₹38 / block',
        rateUnit: 'per 8-inch block',
        paymentTerms: 'Payment on lorry delivery',
        description: 'Automatic hydraulic pressed 8-inch and 6-inch solid & hollow blocks. Strength 5.0 N/mm2 with test certificates. Daily production 6,000 blocks',
        rating: 5,
        tierLevel: 'TIER_1',
      },
      // Bricks
      {
        id: 'cnt_' + crypto.randomUUID().slice(0, 8),
        groupId: 'grp_bricks',
        firmName: 'Sri Amman Chamber Brick Works',
        contactPerson: 'M. Senthil Kumar',
        phone: '98433 99881',
        city: 'Erode',
        areaLocality: 'Kodumudi Road',
        fullAddress: 'Kilambadi, Erode - 638154',
        standardRate: '₹9.50 / brick',
        rateUnit: 'per brick at site',
        paymentTerms: 'Full payment per load (4,000 bricks)',
        description: 'Red kiln burnt 9x4x3 chamber bricks. Heavy ringing sound, sharp edges, minimum breakage guarantee',
        rating: 5,
        tierLevel: 'TIER_1',
      },
      // Steel
      {
        id: 'cnt_' + crypto.randomUUID().slice(0, 8),
        groupId: 'grp_steel',
        firmName: 'Kongu TMT Steel Corporation',
        contactPerson: 'D. Jayachandran',
        phone: '98944 77221',
        city: 'Coimbatore',
        areaLocality: 'Trichy Road',
        fullAddress: '88, Trichy Road, Singanallur, Coimbatore - 641005',
        standardRate: '₹61,800 / ton',
        rateUnit: 'per metric ton',
        paymentTerms: 'RTGS before vehicle dispatch',
        description: 'Tata Tiscon 550D & JSW Neosteel stockist. Available in 8mm, 10mm, 12mm, 16mm, 20mm, 25mm. Mill test TC provided with every invoice',
        rating: 5,
        tierLevel: 'TIER_1',
      },
      // Excavation
      {
        id: 'cnt_' + crypto.randomUUID().slice(0, 8),
        groupId: 'grp_excavation',
        firmName: 'Sakthi Earthmovers & JCB Works',
        contactPerson: 'C. Natarajan',
        phone: '99441 22334',
        city: 'Perundurai',
        areaLocality: 'Chennimalai Road',
        fullAddress: 'Chennimalai Road Junction, Perundurai - 638052',
        standardRate: '₹1,200 / hr',
        rateUnit: 'per hour running',
        paymentTerms: 'Weekly settlement against logbook',
        description: '4 JCB 3DX machines + 2 Hitachi EX200 Poclains with breaker attachment. Skilled operators for foundation trenching and hard rock breaking',
        rating: 5,
        tierLevel: 'TIER_1',
      },
      // Masons
      {
        id: 'cnt_' + crypto.randomUUID().slice(0, 8),
        groupId: 'grp_masons',
        firmName: 'Murugesan Construction Team (Maistry)',
        contactPerson: 'M. Murugesan (Head Maistry)',
        phone: '96554 11223',
        city: 'Erode',
        areaLocality: 'Bhavani',
        fullAddress: 'Bhavani, Erode District',
        standardRate: '₹950 / day',
        rateUnit: 'per head mason / day',
        paymentTerms: 'Saturday weekly batta & wage settlement',
        description: 'Reliable gang of 12 skilled masons + 16 helpers. Experienced in fast AAC block work, plastering, and RCC foundation casting',
        rating: 5,
        tierLevel: 'TIER_1',
      },
    ];

    for (const c of contacts) {
      await client.execute({
        sql: `
          INSERT INTO network_contacts (
            id, group_id, firm_name, contact_person, phone, alternate_phone, email,
            city, area_locality, full_address, standard_rate, rate_unit, payment_terms,
            description, rating, tier_level
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        args: [
          c.id, c.groupId, c.firmName, c.contactPerson, c.phone, c.alternatePhone || null, c.email || null,
          c.city, c.areaLocality || null, c.fullAddress || null, c.standardRate || null, c.rateUnit || null, c.paymentTerms || null,
          c.description || null, c.rating, c.tierLevel
        ],
      });
    }

    console.log(`Seeded ${groups.length} groups and ${contacts.length} contacts successfully.`);
  }

  console.log('Migration completed successfully.');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });

