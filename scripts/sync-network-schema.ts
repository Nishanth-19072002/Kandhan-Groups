import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const url = process.env.TURSO_DATABASE_URL || "file:kandhan_dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

console.log("Connecting to LibSQL/Turso DB:", url.startsWith("libsql") ? "Remote Turso Cloud" : url);

const client = createClient({ url, authToken });

async function syncSchema() {
  try {
    console.log("Creating table network_categories if not exists...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS network_categories (
        id TEXT PRIMARY KEY,
        department TEXT NOT NULL DEFAULT 'MATERIALS',
        name TEXT NOT NULL UNIQUE,
        aliases TEXT,
        default_unit TEXT DEFAULT 'per bag',
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✓ network_categories table ready.");

    console.log("Creating table contact_supplies if not exists...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS contact_supplies (
        id TEXT PRIMARY KEY,
        contact_id TEXT NOT NULL REFERENCES network_contacts(id) ON DELETE CASCADE,
        category_id TEXT NOT NULL REFERENCES network_categories(id) ON DELETE CASCADE,
        brand_or_specs TEXT,
        standard_rate TEXT,
        rate_unit TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✓ contact_supplies table ready.");

    // Seed master categories if empty
    const checkCat = await client.execute("SELECT count(*) as count FROM network_categories");
    const count = Number(checkCat.rows[0]?.count || 0);
    console.log(`Current category count: ${count}`);

    if (count === 0) {
      console.log("Seeding standard civil categories with aliases & units...");
      const standardCategories = [
        // MATERIALS
        {
          id: "cat_mat_cement",
          department: "MATERIALS",
          name: "Cement (OPC / PPC)",
          aliases: "cement, opc 53, opc 43, ppc, ultratech, dalmia, acc, chettinad, ramco, sanghi, bag",
          defaultUnit: "per bag",
          description: "Structural OPC 53/43 Grade, PPC Flyash blended, and Slag cement suppliers.",
        },
        {
          id: "cat_mat_steel",
          department: "MATERIALS",
          name: "TMT Steel Rebars",
          aliases: "steel, kambi, tmt, rebar, rod, jsw, tata tiscon, sail, vizag, 8mm, 10mm, 12mm, 16mm, 20mm, 25mm, fe550d",
          defaultUnit: "per kg",
          description: "Primary & secondary TMT bars (Fe550D / Fe500D) cut and bend delivery.",
        },
        {
          id: "cat_mat_sand",
          department: "MATERIALS",
          name: "Sand & M-Sand / P-Sand",
          aliases: "sand, m sand, msand, p sand, psand, plastering sand, manufactured sand, river sand, aatumanal",
          defaultUnit: "per ton",
          description: "VSI Double Washed M-Sand for concrete and P-Sand for wall plastering.",
        },
        {
          id: "cat_mat_aggregates",
          department: "MATERIALS",
          name: "Aggregates (Blue Metal)",
          aliases: "jalli, blue metal, aggregate, 20mm, 40mm, 12mm, 6mm, baby jelly, crusher dust, gsb, wmm",
          defaultUnit: "per ton",
          description: "Quarry crushed 20mm, 40mm coarse aggregates, GSB and wet mix.",
        },
        {
          id: "cat_mat_bricks",
          department: "MATERIALS",
          name: "Bricks & AAC / Concrete Blocks",
          aliases: "bricks, sengal, hollow block, solid block, aac block, flyash brick, red brick, wire cut",
          defaultUnit: "per block",
          description: "Wire cut red clay bricks, high-strength hollow/solid blocks and AAC light-weight blocks.",
        },
        {
          id: "cat_mat_rmc",
          department: "MATERIALS",
          name: "Ready-Mix Concrete (RMC)",
          aliases: "rmc, readymix, ready mix concrete, transit mixer, m20, m25, m30, boom placer",
          defaultUnit: "per cu.m",
          description: "Computerized batching plant RMC with transit mixer and boom placer pumps.",
        },
        {
          id: "cat_mat_plumbing",
          department: "MATERIALS",
          name: "Plumbing Pipes & Fittings",
          aliases: "plumbing, pipe, cpvc, upvc, swr, ashirvad, astral, supreme, finolex, tank, valve",
          defaultUnit: "per piece",
          description: "CPVC water supply, PVC drainage, water storage tanks, and sanitary pipe fittings.",
        },
        {
          id: "cat_mat_electrical",
          department: "MATERIALS",
          name: "Electrical Conduits, Wires & Panels",
          aliases: "electrical, wire, cable, conduit, finolex, polycab, havells, mcb, distribution board, switch",
          defaultUnit: "per meter",
          description: "FRLS copper wires, PVC conduit pipes, modular switchgear, and LT distribution panels.",
        },
        {
          id: "cat_mat_paints",
          department: "MATERIALS",
          name: "Paints, Primer & Waterproofing Chemicals",
          aliases: "paint, primer, putty, waterproofing, dr fixit, asian paints, berger, fosroc, epoxy, chemical",
          defaultUnit: "per liter",
          description: "Exterior emulsions, acrylic putties, 2K waterproofing coatings, and crystalline admixtures.",
        },
        {
          id: "cat_mat_tiles",
          department: "MATERIALS",
          name: "Tiles, Granite & Marble",
          aliases: "tiles, vitrified, ceramic, granite, marble, kajaria, somany, floor tile, wall tile, epoxy grout",
          defaultUnit: "per sq.ft",
          description: "Vitrified floor tiles, polished granite slabs for counters/steps, and wall tiles.",
        },

        // TRADES & LABOR
        {
          id: "cat_lab_mason",
          department: "TRADES_LABOR",
          name: "Civil Masons & Maistries",
          aliases: "mason, kothanar, chittu aal, bricklayer, plastering maistry, civil labour gang, kothanaar",
          defaultUnit: "per day",
          description: "Head maistries and skilled masonry teams for foundation, brickwork, and plastering.",
        },
        {
          id: "cat_lab_barbender",
          department: "TRADES_LABOR",
          name: "Bar Benders & Steel Fitters",
          aliases: "bar bender, kambi kattu, steel tying, rebar fixer, slab reinforcement gang, kambi aal",
          defaultUnit: "per ton",
          description: "Reinforcement steel cutting, bending, and tying gangs for columns, beams, and slabs.",
        },
        {
          id: "cat_lab_shuttering",
          department: "TRADES_LABOR",
          name: "Centering & Shuttering Team",
          aliases: "centering, shuttering, formwork, slab centering, ply sheet, steel runner, prop gang",
          defaultUnit: "per sq.ft",
          description: "Plywood and steel plate formwork teams with jacks, spans, and safety bracing.",
        },
        {
          id: "cat_lab_plumber",
          department: "TRADES_LABOR",
          name: "Plumbers & Sanitary Mechanics",
          aliases: "plumber, pipe fitter, drainage contractor, sanitary fitting, pump installer",
          defaultUnit: "per point",
          description: "Licensed plumbing gangs for concealed piping, drainage lines, and sanitaryware installations.",
        },
        {
          id: "cat_lab_electrician",
          department: "TRADES_LABOR",
          name: "Licensed Electricians & Wiremen",
          aliases: "electrician, wireman, conduit laying, db dressing, panel board wiring, transformer",
          defaultUnit: "per point",
          description: "Certified 'B'/'C' license industrial and residential electrification contractors.",
        },
        {
          id: "cat_lab_painter",
          department: "TRADES_LABOR",
          name: "Painting Contractors & Polishers",
          aliases: "painter, whitewash, wall putty applicator, texture coating, wood polisher, enamel",
          defaultUnit: "per sq.ft",
          description: "Skilled spraying and manual painting crews for wall putty, primers, and exterior coatings.",
        },

        // EQUIPMENT & RENTAL
        {
          id: "cat_eq_jcb",
          department: "EQUIPMENT",
          name: "JCB & Hydraulic Excavators",
          aliases: "jcb, poclain, excavator, hitachi, breaker, rock breaker, trench digging, basement excavation",
          defaultUnit: "per hour",
          description: "Backhoe loaders and tracked heavy excavators with rock breaker attachments.",
        },
        {
          id: "cat_eq_mixer",
          department: "EQUIPMENT",
          name: "Concrete Mixers & Lift Hoists",
          aliases: "concrete mixer, 1 bag mixer, lift hoist, tower hoist, monkey hoist, vibrator needle",
          defaultUnit: "per day",
          description: "Site concrete mixing machines, high-rise material lift hoists, and needle vibrators.",
        },
        {
          id: "cat_eq_scaffolding",
          department: "EQUIPMENT",
          name: "Scaffolding & Acro Spans Rental",
          aliases: "scaffolding, cuplock, pipe scaffolding, acro span, adjustable prop, jack, walkway",
          defaultUnit: "per month",
          description: "Cuplock scaffolding, telescopic steel props, Acro spans, and H-frames.",
        },
        {
          id: "cat_eq_tipper",
          department: "EQUIPMENT",
          name: "Tipper Lorries & Soil Transport",
          aliases: "tipper, lorry, truck, soil disposal, dumper, 10 wheeler, 6 wheeler, earth shifting",
          defaultUnit: "per trip",
          description: "Site debris clearance, excess earth removal, and material bulk hauling tippers.",
        },

        // SERVICES & CONSULTANTS
        {
          id: "cat_srv_arch",
          department: "SERVICES",
          name: "Architectural & 3D Visualization",
          aliases: "architect, floor plan, 3d elevation, walkthrough, bim, approval drawing, interior designer",
          defaultUnit: "per sq.ft",
          description: "Comprehensive architectural working drawings, sanction approvals, and 3D renders.",
        },
        {
          id: "cat_srv_structural",
          department: "SERVICES",
          name: "Structural Engineering & Steel Design",
          aliases: "structural engineer, staad pro, footing design, column schedule, peb structural design",
          defaultUnit: "per sq.ft",
          description: "Licensed structural design, seismic analysis, foundation design, and PEB industrial design.",
        },
        {
          id: "cat_srv_soil",
          department: "SERVICES",
          name: "Soil Testing & Geo-Technical Survey",
          aliases: "soil test, sbc, bore test, core drilling, plate load test, topography survey, total station",
          defaultUnit: "per bore",
          description: "Safe bearing capacity (SBC) investigation, bore hole logging, and total station land surveys.",
        },
        {
          id: "cat_srv_waterproofing",
          department: "SERVICES",
          name: "Waterproofing & Anti-Termite Specialists",
          aliases: "waterproofing, injection grouting, terrace leak, basement dampness, termite treatment, pest control",
          defaultUnit: "per sq.ft",
          description: "Comprehensive 10-year warranty terrace, basement, and sunken slab waterproofing solutions.",
        },
      ];

      for (const cat of standardCategories) {
        await client.execute({
          sql: `
            INSERT INTO network_categories (id, department, name, aliases, default_unit, description)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(name) DO UPDATE SET
              department = excluded.department,
              aliases = excluded.aliases,
              default_unit = excluded.default_unit,
              description = excluded.description
          `,
          args: [cat.id, cat.department, cat.name, cat.aliases, cat.defaultUnit, cat.description],
        });
      }
      console.log(`✓ Seeded ${standardCategories.length} standard civil categories.`);
    }

    console.log("Database schema sync complete!");
  } catch (error) {
    console.error("Error syncing schema:", error);
    process.exit(1);
  }
}

syncSchema();
