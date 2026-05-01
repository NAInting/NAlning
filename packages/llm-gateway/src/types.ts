export type LlmPurpose =
  | "student_dialogue"
  | "teacher_daily_report"
  | "content_generation"
  | "guardian_weekly_report"
  | "memory_summary"
  | "prompt_test";

export type GatewayUserRole = "student" | "teacher" | "guardian" | "admin" | "system";

export type GatewayPrivacyLevel = "public" | "private" | "campus_local_only";

export type GatewayModelPreference = "fast" | "deep";

export type GatewayMessageRole = "system" | "user" | "assistant";

export type GatewayProvider = "claude_mock" | "qianfan_mock" | "campus_local_mock" | "openai_compatible";

export type GatewayDeployment = "controlled_cloud" | "campus_local";

export interface GatewayMessage {
  role: GatewayMessageRole;
  content: string;
}

export interface GatewayUserContext {
  role: GatewayUserRole;
  tenant_id?: string;
  student_id?: string;
  subject?: string;
}

export interface GatewayCompleteRequest {
  purpose: LlmPurpose;
  messages: readonly GatewayMessage[];
  user_context: GatewayUserContext;
  privacy_level: GatewayPrivacyLevel;
  model_preference?: GatewayModelPreference;
  prompt_id?: string;
  request_id?: string;
  cache?: boolean;
}

export interface PromptTemplate {
  prompt_id: string;
  prompt_version: string;
  purpose: LlmPurpose;
  content: string;
  source_trace: readonly string[];
  active: boolean;
}

export interface PrivacyDecision {
  route_selected: GatewayDeployment;
  sensitive_keyword_hit: boolean;
  reason: "explicit_campus_local_only" | "sensitive_keyword" | "standard_policy";
}

export interface ModelRoute {
  provider: GatewayProvider;
  model: string;
  deployment: GatewayDeployment;
  reason: string;
  fallback?: {
    provider: GatewayProvider;
    model: string;
    deployment: GatewayDeployment;
  };
}

export interface GatewayUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface GatewayCost {
  estimated_cost_cny: number;
  input_cost_cny: number;
  output_cost_cny: number;
}

export interface GatewayCompleteResponse {
  request_id: string;
  content: string;
  provider: GatewayProvider;
  model: string;
  route_selected: GatewayDeployment;
  prompt_id: string;
  prompt_version: string;
  prompt_source_trace: readonly string[];
  usage: GatewayUsage;
  cost: GatewayCost;
  cache_hit: boolean;
  privacy: PrivacyDecision;
}

export interface ProviderCompletionInput {
  purpose: LlmPurpose;
  messages: readonly GatewayMessage[];
  prompt: PromptTemplate;
  request_id: string;
}

export interface ProviderCompletionOutput {
  content: string;
  usage: GatewayUsage;
}

export interface ProviderAdapter {
  provider: GatewayProvider;
  model: string;
  deployment: GatewayDeployment;
  allowed_privacy_levels: readonly GatewayPrivacyLevel[];
  complete(input: ProviderCompletionInput): Promise<ProviderCompletionOutput>;
}

export interface CostEntry {
  request_id: string;
  purpose: LlmPurpose;
  provider: GatewayProvider;
  model: string;
  route_selected: GatewayDeployment;
  prompt_id: string;
  prompt_version: string;
  prompt_source_trace: readonly string[];
  input_tokens: number;
  output_tokens: number;
  estimated_cost_cny: number;
  cache_hit: boolean;
  created_at: string;
}

export interface CostSummary {
  purpose: LlmPurpose;
  calls: number;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_cny: number;
}
