/**
 * ─────────────────────────────────────────────────────────────
 *  SINGLE SOURCE OF TRUTH – edit company details here only.
 * ─────────────────────────────────────────────────────────────
 */
export const siteConfig = {
  name: "Kandhan Groups",
  shortName: "Kandhan",
  tagline: "Building Tomorrow, Managing Everything.",
  description:
    "Kandhan Groups delivers end-to-end civil construction, industrial & factory works, residential homes and complete Project Management Consultancy (PMC) — one partner, one bill, zero hassle.",
  url: "https://kandhangroups.vercel.app",
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
  "Industrial / Factory Civil Works",
  "Residential House / Villa Construction",
  "Commercial Building",
  "Painting & Finishing",
  "Plumbing & Sanitation",
  "Electrical Works",
  "Renovation & Remodelling",
  "Waterproofing",
  "Interior Works",
  "Project Management Consultancy (PMC)",
  "Architectural Design",
  "Software / Website / App Solutions",
  "Other",
] as const;
