import type {
  AccessRequestInput,
  InvestorMe,
  Showcase,
  SmeCard,
  SmeDetail,
} from "./types";

// Fixture data for demo mode only (see lib/config.ts). Every business here is
// invented; none of it comes from, or is sent to, the backend.

const ASK = {
  under_50k: { key: "under_50k", label: "Under $50k" },
  "50k_250k": { key: "50k_250k", label: "$50k to $250k" },
  "250k_1m": { key: "250k_1m", label: "$250k to $1M" },
  over_1m: { key: "over_1m", label: "Over $1M" },
};
const REVENUE = {
  under_100k: { key: "under_100k", label: "Under $100k" },
  "100k_500k": { key: "100k_500k", label: "$100k to $500k" },
  "500k_2m": { key: "500k_2m", label: "$500k to $2M" },
  over_2m: { key: "over_2m", label: "Over $2M" },
};

function sme(
  id: string,
  coverImage: string | null,
  name: string,
  tagline: string,
  rest: Partial<SmeCard>,
): SmeCard {
  return {
    id,
    name,
    tagline,
    description: `${tagline}. Founded in ${rest.city}, the team now serves customers across ${rest.country} and reports its impact twice a year.`,
    logo: null,
    coverImage,
    sectors: [],
    country: null,
    city: null,
    yearFounded: null,
    isFeatured: false,
    hasVideo: false,
    videoUrl: rest.hasVideo
      ? "https://www.youtube.com/watch?v=aqz-KE-bpKQ"
      : null,
    fundingAsk: null,
    revenueBand: null,
    employees: null,
    womenEmployeesPct: null,
    twoXCriteria: [],
    programs: [],
    fundedByMk: false,
    interestExpressed: false,
    ...rest,
  };
}

const SMES: SmeCard[] = [
  sme(
    "demo-1",
    "/media/tailor.jpg",
    "Taka Loop",
    "Turning Nairobi's plastic waste into building materials",
    {
      sectors: ["Circular economy", "Manufacturing"],
      country: "Kenya",
      city: "Nairobi",
      yearFounded: "2019",
      isFeatured: true,
      hasVideo: true,
      fundingAsk: ASK["250k_1m"],
      revenueBand: REVENUE["500k_2m"],
      employees: 64,
      womenEmployeesPct: 58,
      twoXCriteria: ["Leadership", "Employment"],
      programs: ["Green Growth Cohort"],
      fundedByMk: true,
    },
  ),
  sme(
    "demo-2",
    "/media/harvest.jpg",
    "Shamba Fresh",
    "Cold chain logistics for smallholder farmers",
    {
      sectors: ["Agriculture", "Mobility"],
      country: "Uganda",
      city: "Kampala",
      yearFounded: "2020",
      isFeatured: true,
      hasVideo: true,
      fundingAsk: ASK["50k_250k"],
      revenueBand: REVENUE["100k_500k"],
      employees: 38,
      womenEmployeesPct: 47,
      twoXCriteria: ["Employment"],
      programs: ["Agri Resilience"],
      fundedByMk: true,
    },
  ),
  sme(
    "demo-3",
    "/media/seedlings.jpg",
    "Jua Kali Solar",
    "Pay as you go solar for market traders",
    {
      sectors: ["Clean energy"],
      country: "Tanzania",
      city: "Arusha",
      yearFounded: "2018",
      isFeatured: true,
      fundingAsk: ASK.over_1m,
      revenueBand: REVENUE.over_2m,
      employees: 121,
      womenEmployeesPct: 41,
      twoXCriteria: ["Consumption"],
      programs: ["Green Growth Cohort"],
      fundedByMk: true,
    },
  ),
  sme(
    "demo-4",
    "/media/team.jpg",
    "Mama Maji",
    "Affordable water kiosks run by women's groups",
    {
      sectors: ["Water and sanitation"],
      country: "Kenya",
      city: "Kisumu",
      yearFounded: "2021",
      fundingAsk: ASK["50k_250k"],
      revenueBand: REVENUE.under_100k,
      employees: 22,
      womenEmployeesPct: 82,
      twoXCriteria: ["Leadership", "Employment", "Consumption"],
      programs: ["Women in Enterprise"],
    },
  ),
  sme(
    "demo-5",
    "/media/seedlings.jpg",
    "Kijani Packaging",
    "Compostable packaging from sugarcane waste",
    {
      sectors: ["Circular economy", "Manufacturing"],
      country: "Rwanda",
      city: "Kigali",
      yearFounded: "2020",
      hasVideo: true,
      fundingAsk: ASK["250k_1m"],
      revenueBand: REVENUE["100k_500k"],
      employees: 45,
      womenEmployeesPct: 53,
      twoXCriteria: ["Employment"],
      programs: ["Green Growth Cohort"],
      fundedByMk: true,
    },
  ),
  sme(
    "demo-6",
    "/media/meeting.jpg",
    "Afya Link",
    "Diagnostics delivered to rural clinics",
    {
      sectors: ["Health", "Technology"],
      country: "Ghana",
      city: "Kumasi",
      yearFounded: "2019",
      fundingAsk: ASK["250k_1m"],
      revenueBand: REVENUE["500k_2m"],
      employees: 57,
      womenEmployeesPct: 61,
      twoXCriteria: ["Leadership"],
      programs: [],
      fundedByMk: true,
    },
  ),
  sme(
    "demo-7",
    "/media/team.jpg",
    "Soko Thread",
    "Ethical apparel made from upcycled textiles",
    {
      sectors: ["Creative industries", "Circular economy"],
      country: "Kenya",
      city: "Mombasa",
      yearFounded: "2022",
      fundingAsk: ASK.under_50k,
      revenueBand: REVENUE.under_100k,
      employees: 14,
      womenEmployeesPct: 86,
      twoXCriteria: ["Leadership", "Employment"],
      programs: ["Women in Enterprise"],
    },
  ),
  sme(
    "demo-8",
    "/media/trader.jpg",
    "Boda Charge",
    "Battery swap stations for electric motorcycles",
    {
      sectors: ["Mobility", "Clean energy"],
      country: "Uganda",
      city: "Jinja",
      yearFounded: "2021",
      hasVideo: true,
      fundingAsk: ASK.over_1m,
      revenueBand: REVENUE["500k_2m"],
      employees: 73,
      womenEmployeesPct: 34,
      programs: ["Green Growth Cohort"],
      fundedByMk: true,
    },
  ),
  sme(
    "demo-9",
    null,
    "Nafaka Mills",
    "Fortified flour for school feeding programmes",
    {
      sectors: ["Agriculture", "Manufacturing"],
      country: "Nigeria",
      city: "Kano",
      yearFounded: "2017",
      fundingAsk: ASK["50k_250k"],
      revenueBand: REVENUE["100k_500k"],
      employees: 49,
      womenEmployeesPct: 44,
      twoXCriteria: ["Employment"],
      programs: ["Agri Resilience"],
    },
  ),
];

const unique = (values: string[]) =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b));

export const demoShowcase: Showcase = {
  stats: {
    smes: SMES.length,
    countries: unique(SMES.flatMap((s) => (s.country ? [s.country] : [])))
      .length,
    sectors: unique(SMES.flatMap((s) => s.sectors)).length,
    jobsSupported: SMES.reduce((sum, s) => sum + (s.employees ?? 0), 0),
    womenEmployeesPct: 52,
    capitalDeployedUsd: 3_640_000,
  },
  filters: {
    sectors: unique(SMES.flatMap((s) => s.sectors)),
    countries: unique(SMES.flatMap((s) => (s.country ? [s.country] : []))),
    programs: unique(SMES.flatMap((s) => s.programs)),
    askBands: Object.values(ASK),
  },
  smes: SMES,
};

const interests = new Set<string>();

export function demoSme(id: string): SmeDetail | null {
  const card = SMES.find((s) => s.id === id);
  if (!card) return null;
  const employees = card.employees ?? 20;
  const women = Math.round((employees * (card.womenEmployeesPct ?? 50)) / 100);
  const growth = [100, 118, 141, 163, 190, 224];

  return {
    ...card,
    interestExpressed: interests.has(id),
    summary: `${card.name} started in ${card.city} after its founders saw the same problem every day and decided to fix it at the source. The business now serves customers across ${card.country} and has grown revenue in each of the last six reporting periods.\n\nThe team combines local distribution with simple, durable technology. Unit economics are positive at the branch level, and the next phase is about replicating a model that already works.`,
    useOfFunds:
      "Two new production sites, working capital for larger purchase orders, and a regional sales team.",
    website: "https://example.com",
    entityType: "Private limited company",
    youthEmployeesPct: 46,
    countriesOfOperation: unique(
      [card.country ?? "Kenya", "Kenya", "Uganda"].filter(Boolean),
    ),
    photos: [
      "/media/team.jpg",
      "/media/seedlings.jpg",
      "/media/trader.jpg",
    ].filter((photo) => photo !== card.coverImage),
    videos: card.hasVideo
      ? [
          {
            id: `${id}-v1`,
            videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
            source: "youtube",
            title: `Inside ${card.name}`,
            thumbnailUrl: null,
            isFeatured: true,
          },
          {
            id: `${id}-v2`,
            videoUrl: "https://vimeo.com/76979871",
            source: "vimeo",
            title: "Founder story",
            thumbnailUrl: null,
            isFeatured: false,
          },
        ]
      : [],
    impact: growth.map((revenueIndex, index) => {
      const share = (index + 3) / (growth.length + 2);
      return {
        reportingDate: `${2024 + Math.floor(index / 2)}-${index % 2 === 0 ? "06" : "12"}-30`,
        revenueIndex,
        totalEmployees: Math.round(employees * share),
        femaleEmployees: Math.round(women * share),
        youthEmployees: Math.round(employees * share * 0.46),
        newCustomers: 180 + index * 95,
      };
    }),
    trackRecord: card.fundedByMk
      ? {
          loansCount: 2,
          totalFunded: ASK["50k_250k"],
          repaymentSignal: "on_time",
        }
      : null,
    interest: interests.has(id)
      ? { status: "new", createdAt: "2026-10-01T09:00:00.000Z" }
      : null,
  };
}

export function demoExpressInterest(id: string) {
  interests.add(id);
  return { status: "new" as const, createdAt: "2026-10-01T09:00:00.000Z" };
}

/**
 * Demo access state. Starts approved at the partner tier so the dashboard is
 * the first thing shown; append ?demo=none, pending or rejected to any URL to
 * preview the other access screens.
 */
let demoMe: InvestorMe = {
  status: "approved",
  tier: "partner",
  isStaff: false,
  request: null,
};

// Once a request is sent in this session, the ?demo override stops applying so
// the flow can continue to the status screen.
let demoSubmitted = false;

export function getDemoMe(): InvestorMe {
  if (typeof window !== "undefined" && !demoSubmitted) {
    const forced = new URLSearchParams(window.location.search).get("demo");
    if (forced === "none") return { ...demoMe, status: "none", tier: null };
    if (forced === "pending" || forced === "rejected") {
      return {
        status: forced,
        tier: null,
        isStaff: false,
        request: {
          id: "demo-request",
          firmName: "Savannah Ventures",
          investorType: "venture_capital",
          jobTitle: "Principal",
          country: "Kenya",
          website: null,
          ticketSize: "250k_1m",
          sectorsOfInterest: ["Clean energy", "Agriculture"],
          note: null,
          status: forced,
          tier: null,
          rejectionReason:
            forced === "rejected"
              ? "We could not verify the firm from the details provided."
              : null,
          createdAt: "2026-09-29T08:30:00.000Z",
          reviewedAt: null,
        },
      };
    }
  }
  return demoMe;
}

export function demoSubmitRequest(input: AccessRequestInput): InvestorMe {
  demoSubmitted = true;
  demoMe = {
    status: "pending",
    tier: null,
    isStaff: false,
    request: {
      ...input,
      id: "demo-request",
      status: "pending",
      tier: null,
      rejectionReason: null,
      createdAt: "2026-10-01T09:00:00.000Z",
      reviewedAt: null,
    },
  };
  return demoMe;
}
