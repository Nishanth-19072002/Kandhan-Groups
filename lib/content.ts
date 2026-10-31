import type { IconName } from "@/components/ui/Icon";

export const services: { icon: IconName; title: string; desc: string }[] = [
  { icon: "factory", title: "Industrial & Factory Civil Works", desc: "Foundations, sheds, PEB structures, flooring, compound walls and plant infrastructure built to industrial standards." },
  { icon: "home", title: "Residential Construction", desc: "Independent houses, villas and duplexes, from bhoomi pooja to handover, built around how your family lives." },
  { icon: "building", title: "Commercial Buildings", desc: "Offices, showrooms, warehouses and mixed-use spaces built to finish on time and within budget." },
  { icon: "paint", title: "Painting & Finishing", desc: "Interior and exterior painting, texture and protective coatings, with a flawless, long-lasting finish." },
  { icon: "pipe", title: "Plumbing & Sanitation", desc: "Water supply, drainage, STP lines and premium bathroom fittings: leak-free and pressure-tested." },
  { icon: "bolt", title: "Electrical Works", desc: "Wiring, panels, lighting and industrial power distribution handled by certified electricians." },
  { icon: "hammer", title: "Renovation & Remodelling", desc: "Breathe new life into old spaces with structural repairs, upgrades and full makeovers." },
  { icon: "drop", title: "Waterproofing", desc: "Terrace, basement, bathroom and tank waterproofing that keeps the monsoon out for good." },
  { icon: "sofa", title: "Interior Works", desc: "Modular kitchens, false ceilings, wardrobes and turnkey interiors that look as good as the design." },
  { icon: "clipboard", title: "Project Management (PMC)", desc: "We plan, outsource, supervise and deliver your entire project. You get one point of contact and one bill." },
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
    label: "Industrial",
    icon: "factory",
    image: "/images/industrial.jpg",
    title: "Industrial & Factory Infrastructure",
    description:
      "Factories can't afford downtime. We run industrial civil works with tight schedules, strict safety protocols and engineering precision. That covers greenfield plants, capacity expansions and maintenance works inside a running facility.",
    scope: ["Factory sheds & PEB structures", "Heavy-duty industrial flooring", "Machine foundations", "Roads, drains & compound walls", "Utility & ETP/STP civil works", "Annual maintenance contracts"],
    outcomes: ["Minimal disruption to operations", "Safety-first execution", "Quality checks at every stage"],
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

