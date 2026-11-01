export type TriState = "met" | "not-met" | "unknown";
export type YesNo = "yes" | "no" | "unknown" | "";
export type ProgramCategoryId =
  | "pendidikan"
  | "pekerjaan"
  | "sosial"
  | "kesehatan"
  | "usaha"
  | "perumahan"
  | "rentan";
export type ServiceCategoryId =
  | "kependudukan"
  | "pajak"
  | "transportasi"
  | "imigrasi"
  | "jaminan-sosial"
  | "perizinan"
  | "akademik"
  | "ketenagakerjaan"
  | "pertanahan"
  | "hukum"
  | "daerah"
  | "pengaduan";
export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}
export interface RegionCoverage {
  level: "national" | "province" | "city";
  provinces: string[];
  cities: string[];
}
export interface SourceReference {
  label: string;
  url: string;
}
export interface Profile {
  provinceCode?: string;
  cityCode?: string;
  activitiesOther?: string;
  province?: string;
  city?: string;
  activities?: string[];
  education?: string;
  year?: string;
  interests?: ProgramCategoryId[];
  age?: string;
  student?: YesNo;
  business?: YesNo;
  firstHome?: YesNo;
  previousHousingSubsidy?: YesNo;
}
export type RuleField =
  | keyof Profile
  | "economy"
  | "admitted"
  | "programCriteria"
  | "officialAssessment";
export interface EligibilityRule {
  id: string;
  field: RuleField;
  allowed: readonly string[];
  label: string;
  required: boolean;
  sourceUrl: string;
}
export interface ProgramMetadata {
  detail?: import("./program-detail-model").ProgramDetailConfig;
  benefitTypes?: string[];
  timeline?: ProgramTimeline;
  primaryCategory: ProgramCategoryId;
  secondaryCategories: ProgramCategoryId[];
  programType:
    "education-support" | "training" | "financing" | "rehabilitation";
  targetGroups: string[];
  educationLevels: string[];
  employmentStatuses: string[];
  governmentLevel: "pusat" | "daerah";
  regionCoverage: RegionCoverage;
  benefitType: "biaya-pendidikan" | "pelatihan" | "pembiayaan" | "pendampingan";
  eligibilityRules: EligibilityRule[];
  dataCompleteness: "verified-core" | "requires-assessment";
}
export interface ProgramTimeline {
  addedOn: string | null;
  firstRecordedOn: string;
  recordingBasis: "baseline" | "addition";
  contentReviewedOn: string;
  scheduleVerifiedOn: string | null;
  periods: {
    label: string;
    opensOn: string;
    closesOn: string;
    sourceUrl: string;
  }[];
}
export interface ServiceMetadata {
  primaryCategory: ServiceCategoryId;
  aliases: string[];
  serviceChannels: ("online" | "offline")[];
  applicantType: "wni" | "perseorangan" | "umum";
  governmentLevel: "pusat" | "daerah";
  regionCoverage: RegionCoverage;
  locations: { name: string; url: string }[];
}
export interface SavedPlan {
  done: number[];
  variant: string;
  savedAt?: number;
  goal?: string;
}
export interface LocalIdentity {
  id: string;
  displayName: string;
  email: string;
}
export interface AccountRecord {
  identity: LocalIdentity;
  profile: Profile;
  plans: Record<string, SavedPlan>;
}
export interface SessionSnapshot {
  activeId: string | null;
  accounts: Record<string, AccountRecord>;
}
export interface AccountAdapter {
  read(): SessionSnapshot;
  write(state: SessionSnapshot): void;
  reset(): void;
}
export interface RuleResult {
  id: string;
  label: string;
  state: TriState;
  sourceUrl: string;
}
export interface Recommendation {
  id: string;
  status:
    | "Berpotensi Relevan"
    | "Perlu Periksa Persyaratan"
    | "Belum Sesuai dengan Kondisi";
  reasons: string[];
  rules: RuleResult[];
}
