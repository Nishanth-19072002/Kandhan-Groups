/**
 * ─────────────────────────────────────────────────────────────
 *  SINGLE SOURCE OF TRUTH – edit company details here only.
 * ─────────────────────────────────────────────────────────────
 */
export const siteConfig = {
  name: "Kandhan Groups",
  shortName: "Kandhan",
  tagline: "Every Structure Deserves A Legacy.",
  description:
    "Kandhan Groups delivers end-to-end civil contracts inside companies & factories, individual residential homes, building excavation, architectural design, plumbing & painting contracts, software solutions, smart home & STP automation, and complete turnkey project management from scratch to finishing.",
  url: "https://kandhangroups.com",
  /** Official company logo in /public */
  logo: "/logo.png" as string | null,
  contact: {
    phones: [
      { display: "+91 63639 02388", raw: "+916363902388" },
      { display: "+91 77958 33418", raw: "+917795833418" },
    ],
    // Primary WhatsApp number (without "+")
    whatsapp: "916363902388",
    emails: ["kandhangroups1964@gmail.com", "snishanth465@gmail.com"],
    address: "Bengaluru, Karnataka, India",
    serviceArea: "Bengaluru & across South India",
  },
};

export const workTypes = [
  "Civil Work Contracts Inside Companies & Factories",
  "Individual Homes & Residential Buildings",
  "Building Excavation, Architecture & Planning",
  "Plumbing, Painting & Finishing Contracts",
  "Turnkey Project Management (Scratch to Finishing)",
  "Architectural Planning & 3D Design",
  "Software Solutions & Smart Home Automation",
  "Renovation & Remodelling",
  "Waterproofing & Surface Protection",
  "Other",
] as const;
