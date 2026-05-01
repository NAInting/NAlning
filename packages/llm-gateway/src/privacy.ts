import type { GatewayCompleteRequest, PrivacyDecision } from "./types";

const SENSITIVE_PATTERNS = [
  "自杀",
  "不想活",
  "轻生",
  "家暴",
  "被打",
  "害怕回家",
  "伤害自己",
  "抑郁",
  "崩溃",
  "隐私",
  "身份证"
];

export function hasSensitiveKeyword(request: GatewayCompleteRequest): boolean {
  const combinedText = request.messages.map((message) => message.content).join("\n");
  return SENSITIVE_PATTERNS.some((pattern) => combinedText.includes(pattern));
}

export function decidePrivacyRoute(request: GatewayCompleteRequest): PrivacyDecision {
  if (request.privacy_level === "campus_local_only") {
    return {
      route_selected: "campus_local",
      sensitive_keyword_hit: false,
      reason: "explicit_campus_local_only"
    };
  }

  if (hasSensitiveKeyword(request)) {
    return {
      route_selected: "campus_local",
      sensitive_keyword_hit: true,
      reason: "sensitive_keyword"
    };
  }

  return {
    route_selected: "controlled_cloud",
    sensitive_keyword_hit: false,
    reason: "standard_policy"
  };
}
