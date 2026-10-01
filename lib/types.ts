// Mirrors mk-backend/src/modules/investor-showcase/investor-showcase.model.ts.

export type InvestorTier = "investor" | "partner";
export type AccessStatus =
  | "none"
  | "pending"
  | "approved"
  | "rejected"
  | "revoked";
export type InterestStatus = "new" | "contacted" | "closed";

export interface Band {
  key: string;
  label: string;
}

export interface AccessRequest {
  id: string;
  firmName: string;
  investorType: string;
  jobTitle: string | null;
  country: string | null;
  website: string | null;
  ticketSize: string | null;
  sectorsOfInterest: string[];
  note: string | null;
  status: Exclude<AccessStatus, "none">;
  tier: InvestorTier | null;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface InvestorMe {
  status: AccessStatus;
  tier: InvestorTier | null;
  isStaff: boolean;
  request: AccessRequest | null;
}

export interface AccessRequestInput {
  firmName: string;
  investorType: string;
  jobTitle: string | null;
  country: string | null;
  website: string | null;
  ticketSize: string | null;
  sectorsOfInterest: string[];
  note: string | null;
}

export interface SmeCard {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  sectors: string[];
  country: string | null;
  city: string | null;
  yearFounded: string | null;
  isFeatured: boolean;
  hasVideo: boolean;
  videoUrl: string | null;
  fundingAsk: Band | null;
  revenueBand: Band | null;
  employees: number | null;
  womenEmployeesPct: number | null;
  twoXCriteria: string[];
  programs: string[];
  fundedByMk: boolean;
  interestExpressed: boolean;
}

export interface SmeVideo {
  id: string;
  videoUrl: string;
  source: string | null;
  title: string | null;
  thumbnailUrl: string | null;
  isFeatured: boolean;
}

export interface ImpactPoint {
  reportingDate: string;
  revenueIndex: number | null;
  totalEmployees: number | null;
  femaleEmployees: number | null;
  youthEmployees: number | null;
  newCustomers: number | null;
}

export interface TrackRecord {
  loansCount: number;
  totalFunded: Band | null;
  repaymentSignal: "on_time" | "late" | "repaid";
}

export interface SmeDetail extends SmeCard {
  summary: string | null;
  useOfFunds: string | null;
  website: string | null;
  entityType: string | null;
  youthEmployeesPct: number | null;
  countriesOfOperation: string[];
  photos: string[];
  videos: SmeVideo[];
  impact: ImpactPoint[];
  trackRecord: TrackRecord | null;
  interest: { status: InterestStatus; createdAt: string } | null;
}

export interface ShowcaseStats {
  smes: number;
  countries: number;
  sectors: number;
  jobsSupported: number;
  womenEmployeesPct: number | null;
  capitalDeployedUsd: number;
}

export interface Showcase {
  stats: ShowcaseStats;
  filters: {
    sectors: string[];
    countries: string[];
    programs: string[];
    askBands: Band[];
  };
  smes: SmeCard[];
}
