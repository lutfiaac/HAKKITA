export type ProgramMechanism =
  | "self_registration"
  | "competitive_selection"
  | "recipient_assignment"
  | "financing"
  | "subsidy"
  | "assessment_referral"
  | "training"
  | "service_delivery"
  | "hybrid"
  | "unknown";
export type InformationStatus =
  | "verified"
  | "unverified"
  | "unknown"
  | "not_applicable"
  | "conditional"
  | "outdated"
  | "conflicting";
export interface Information<T> {
  status: InformationStatus;
  value?: T;
  note?: string;
  sourceIds?: string[];
}
export interface DetailSource {
  id: string;
  title: string;
  url: string;
  organization?: string;
  type?: "page" | "pdf" | "portal" | "regulation";
  publishedOn?: string;
  updatedOn?: string;
  checkedOn?: string;
  status: InformationStatus;
  availability?: "available" | "unavailable" | "unknown";
}
export interface ProgramDocument {
  id: string;
  name: string;
  requirement:
    "required" | "optional" | "conditional" | "alternative" | "confirm";
  condition?: string;
  alternatives?: string[];
  route?: string;
  region?: string;
  guide?: { id: string; reason: string };
}
export interface AccessStep {
  title: string;
  description?: string;
  mode?: "online" | "offline" | "mixed";
  condition?: string;
  url?: string;
}
export interface AccessRoute {
  id: string;
  label: string;
  description?: string;
  region?: string;
  steps: AccessStep[];
}
export interface BenefitValue {
  label: string;
  kind:
    | "fixed"
    | "range"
    | "percentage"
    | "non_cash"
    | "goods"
    | "service"
    | "financing"
    | "assessment"
    | "variable";
  amount?: number;
  maximum?: number;
  currency?: string;
  unit?: string;
  condition?: string;
}
export interface RequirementGroup {
  title: string;
  items: string[];
}
export interface DetailAction {
  kind:
    | "registration"
    | "financing"
    | "guide"
    | "information"
    | "status"
    | "contact";
  url?: string;
  heading?: string;
  description?: string;
  status?: InformationStatus;
}
export interface ProgramDetailConfig {
  mechanisms: ProgramMechanism[];
  metadata?: { label: string; value: string }[];
  lifecycle?: Information<"active" | "renamed" | "discontinued" | "legacy">;
  renamedTo?: string;
  overview?: string;
  targets?: Information<string[]>;
  benefits?: Information<string[]>;
  benefitValues?: Information<BenefitValue[]>;
  requirements?: Information<RequirementGroup[]>;
  documents?: Information<ProgramDocument[]>;
  access?: Information<AccessRoute[]>;
  registration?: Information<"unknown" | "unannounced" | "none">;
  action?: DetailAction;
  notices?: { status: InformationStatus; text: string }[];
  relatedGuides?: { id: string; reason: string }[];
  sources?: DetailSource[];
}
export interface ProgramDetailInput {
  id: string;
  name: string;
  category: string;
  summary?: string;
  about?: string;
  agency?: string;
  region?: string;
  official?: string;
  lastVerifiedAt?: string;
  benefits?: string[];
  requirements?: string[];
  documents?: string[];
  steps?: string[];
  note?: string;
  targetGroups?: string[];
  educationLevels?: string[];
  sources?: { label: string; url: string }[];
  timeline?: import("./models").ProgramTimeline | null;
  detail?: ProgramDetailConfig;
}
export type DetailSection = {
  id: string;
  title: string;
} & (
  | { kind: "text"; information: Information<string> }
  | { kind: "list"; information: Information<string[]> }
  | { kind: "requirements"; information: Information<RequirementGroup[]> }
  | { kind: "documents"; information: Information<ProgramDocument[]> }
  | { kind: "access"; information: Information<AccessRoute[]> }
  | { kind: "values"; information: Information<BenefitValue[]> }
);
