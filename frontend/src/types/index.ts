export type WebsiteStatus = 
  | 'NO_WEBSITE' 
  | 'SOCIAL_ONLY' 
  | 'BROKEN_OR_INACTIVE' 
  | 'ACTIVE_OFFICIAL';

export type LeadStatus = 
  | 'ALL'
  | 'HIGH_URGENCY'
  | 'AUDITED' 
  | 'CONTACTED' 
  | 'CONVERTED';

export type OutreachAngle = 
  | 'GROWTH_MISSED_REVENUE' 
  | 'DIRECT_TECHNICAL_FLAW' 
  | 'COMPETITOR_COMPARISON';

export interface DigitalVulnerability {
  area: 'MOBILE' | 'PERFORMANCE' | 'SECURITY_SSL' | 'MISSING_WEBSITE' | 'CONVERSION_LEADS' | 'SEO';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  observation: string;
  business_impact: string;
}

export interface SuggestedFeature {
  feature_name: string;
  value_proposition: string;
  estimated_complexity: 'SIMPLE' | 'MODERATE' | 'ADVANCED';
}

export interface AIAnalysis {
  business_summary: string;
  identified_niche: string;
  qualification_status: 'QUALIFIED' | 'MARGINAL' | 'DISQUALIFIED';
  qualification_reason: string;
  digital_vulnerabilities: DigitalVulnerability[];
  suggested_features: SuggestedFeature[];
  agency_value_proposition: string;
}

export interface WebsiteAudit {
  website_url?: string;
  website_status: WebsiteStatus;
  social_platform?: string;
  performance_score: number; // 0-100
  accessibility_score: number;
  seo_score: number;
  mobile_responsive: boolean;
  has_valid_ssl: boolean;
  first_contentful_paint_ms: number;
  largest_contentful_paint_ms: number;
  cms_detected?: string;
  technical_issues_summary: string;
}

export interface ContactInfo {
  email?: string;
  verification_status: 'VERIFIED_DELIVERABLE' | 'ACCEPT_ALL_UNVERIFIED' | 'NO_MX_RECORDS' | 'UNAVAILABLE';
  primary_mx_host?: string;
  phone: string;
  source_url?: string;
  confidence_score: number;
}

export interface OpportunityScoreBreakdown {
  total_score: number; // 0-100
  website_deficit: number; // 0-35
  commercial_viability: number; // 0-30
  contact_access: number; // 0-20
  agency_fit: number; // 0-15
  deficit_reason: string;
  viability_reason: string;
  contact_reason: string;
  fit_reason: string;
}

export interface BusinessLead {
  id: string;
  name: string;
  category: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  star_rating: number;
  review_count: number;
  price_level: number;
  status: 'NEW' | 'AUDITED' | 'CONTACTED' | 'CONVERTED' | 'REJECTED';
  is_high_urgency: boolean;
  audit: WebsiteAudit;
  score: OpportunityScoreBreakdown;
  ai_analysis: AIAnalysis;
  contact: ContactInfo;
  created_at: string;
}

export interface SearchFilters {
  city: string;
  category: string;
  radius_km: number;
  query: string;
  status_filter: LeadStatus;
}
