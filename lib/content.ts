import type { IconName } from "@/components/ui/Icon";

export const services: { icon: IconName; title: string; desc: string; workType?: string }[] = [
  {
    icon: "factory",
    title: "Civil Works in Companies & Factories",
    desc: "In-plant civil contracts, equipment foundation pads, flooring, partitions, and internal civil modifications.",
    workType: "Civil Work Contracts Inside Companies & Factories",
  },
  {
    icon: "home",
    title: "Individual Homes & Residential Buildings",
    desc: "Complete construction from bhoomi pooja to housewarming. Turnkey execution from scratch to finishing with guaranteed delivery.",
    workType: "Individual Homes & Residential Buildings",
  },
  {
    icon: "compass",
    title: "Building Excavation & Earthwork",
    desc: "Precision site excavation, land leveling, soil clearing, and foundation trenching for houses and company facilities.",
    workType: "Building Excavation, Architecture & Planning",
  },
  {
    icon: "paint",
    title: "Painting & Texture Finishing",
    desc: "Interior & exterior painting contracts, weather-proof coatings, and premium texture finishing for homes and buildings.",
    workType: "Plumbing, Painting & Finishing Contracts",
  },
  {
    icon: "pipe",
    title: "Plumbing & Sanitation Contracts",
    desc: "Complete water supply lines, sanitary pipelines, and premium bathroom fittings: leak-free and pressure-tested.",
    workType: "Plumbing, Painting & Finishing Contracts",
  },
  {
    icon: "compass",
    title: "Architectural Planning & 3D Design",
    desc: "2D floor plans, photorealistic 3D elevations, structural blueprints, and Vastu-compliant layouts engineered to precision.",
    workType: "Architectural Planning & 3D Design",
  },
  {
    icon: "code",
    title: "Software & Home Automation Control",
    desc: "Smart home automation systems to control lighting, appliances, and custom software solutions for your operations.",
    workType: "Software Solutions & Smart Home Automation",
  },
  {
    icon: "hammer",
    title: "Renovation & Remodelling",
    desc: "Transform existing buildings with structural alterations, modern room additions, civil expansions, and full makeover execution.",
    workType: "Renovation & Remodelling",
  },
  {
    icon: "drop",
    title: "Waterproofing & Protection",
    desc: "Basement, terrace, bathroom, and overhead tank waterproofing systems engineered to stop all leaks permanently.",
    workType: "Waterproofing & Surface Protection",
  },
  {
    icon: "clipboard",
    title: "Turnkey Project Management (PMC)",
    desc: "We take your project, manage all contractors, supervise quality, and execute from scratch to finishing — one point of contact, one bill.",
    workType: "Turnkey Project Management (Scratch to Finishing)",
  },
];

export type Specialization = {
  key: string;
  label: string;
  icon: IconName;
  image: string;
  title: string;
  description: string;
  scope: string[];
  outcomes: string[];
};

export const specializations: Specialization[] = [
  {
    key: "industrial",
    label: "Company Civil",
    icon: "factory",
    image: "/images/industrial.jpg",
    title: "Civil Works in Companies & Factories",
    description:
      "We execute internal civil work contracts inside operating companies and factories with tight schedules and quality execution. Covering civil alterations, flooring, partitions, and plant facility upgrades.",
    scope: ["Company & factory civil contracts", "VDF & epoxy flooring", "Equipment foundation pads", "Internal partitions & compound walls", "Civil modifications & renovations"],
    outcomes: ["Minimal disruption to operations", "Clean and timely execution", "Quality checks at every stage"],
  },
  {
    key: "residential",
    label: "Residential",
    icon: "home",
    image: "/images/residential.jpg",
    title: "Homes Built Around Your Life",
    description:
      "Your home is your biggest investment and your most personal one. We guide you from plan approval to the housewarming. You get transparent costs, quality materials and weekly progress updates, so you never have to chase anyone.",
    scope: ["Independent houses & villas", "Duplex & G+N buildings", "Vastu-aligned planning", "Structural & civil works", "Elevation & façade design", "Turnkey handover"],
    outcomes: ["Fixed, itemised estimates", "Branded, verified materials", "Photo & video progress updates"],
  },
  {
    key: "commercial",
    label: "Commercial",
    icon: "building",
    image: "/images/commercial.jpg",
    title: "Commercial Spaces That Perform",
    description:
      "Offices, showrooms, warehouses and retail spaces built to work as hard as your business. We balance aesthetics, function and speed so you can open your doors sooner.",
    scope: ["Office & IT spaces", "Showrooms & retail", "Warehouses & godowns", "Hospitals & institutions", "Fit-outs & refurbishments", "Façade & glazing"],
    outcomes: ["Fast-track scheduling", "Code-compliant construction", "Ready-to-operate handover"],
  },
  {
    key: "finishing",
    label: "Finishing & MEP",
    icon: "paint",
    image: "/images/finishing.jpg",
    title: "Painting, Plumbing & Electrical: Perfected",
    description:
      "The details are what people notice. Our finishing and MEP teams handle painting, plumbing, electrical, waterproofing and interiors with the care of craftsmen and the discipline of engineers.",
    scope: ["Interior & exterior painting", "Texture & protective coatings", "Plumbing & sanitation", "Electrical & lighting", "Waterproofing systems", "Tiling, flooring & false ceilings"],
    outcomes: ["Clean, on-schedule work", "Tested & warrantied systems", "Premium, long-lasting finish"],
  },
  {
    key: "pmc",
    label: "PMC",
    icon: "clipboard",
    image: "/images/pmc.jpg",
    title: "Project Management Consultancy",
    description:
      "Have a project but no time to manage ten contractors? Hand it to us. We take full ownership: planning, contractor selection, procurement, supervision, quality, safety and billing. Our specialist partners do the work under our management, and you deal only with us.",
    scope: ["Project planning & scheduling", "Contractor sourcing & vetting", "Procurement & cost control", "Site supervision & QA/QC", "Safety & compliance", "Single consolidated billing"],
    outcomes: ["One contract, one invoice", "Full accountability with us", "Real-time progress reporting"],
  },
];

export const processSteps = [
  { icon: "phone" as IconName, title: "Consultation", desc: "Tell us what you need. We listen, ask the right questions and understand your goals, timeline and budget." },
  { icon: "pin" as IconName, title: "Site Survey", desc: "Our engineers visit your site to assess conditions, measurements, access and technical requirements." },
  { icon: "compass" as IconName, title: "Design & Estimate", desc: "You get a clear plan, drawings where needed and a transparent, itemised quotation with no hidden costs." },
  { icon: "hardhat" as IconName, title: "Execution", desc: "Skilled teams and vetted partners start work under our supervision, following an agreed schedule." },
  { icon: "shield" as IconName, title: "Quality & Safety Checks", desc: "Stage-wise inspections, material checks and safety audits make sure everything meets the standard." },
  { icon: "handshake" as IconName, title: "Handover & Support", desc: "We hand over a clean, finished project with documentation and stay with you for post-handover support." },
];

export const promises: { icon: IconName; title: string; desc: string }[] = [
  { icon: "rupee", title: "Transparent Pricing", desc: "Itemised quotes and honest billing. What we quote is what you pay, with no surprise extras." },
  { icon: "user", title: "One Point of Contact", desc: "A dedicated project lead who answers your calls and owns every decision on site." },
  { icon: "calendar", title: "Committed Timelines", desc: "Realistic schedules, shared upfront and tracked every week, with no endless delays." },
  { icon: "shield", title: "Quality You Can Verify", desc: "Branded materials, stage-wise inspections and photo reports you can check yourself." },
  { icon: "hardhat", title: "Safety First, Always", desc: "Trained crews, PPE on every site and compliance with safety norms. No shortcuts." },
  { icon: "layers", title: "Single Consolidated Bill", desc: "Multiple trades, one invoice. We manage the vendors and you manage nothing." },
];

