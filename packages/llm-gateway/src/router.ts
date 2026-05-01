import type { GatewayCompleteRequest, ModelRoute, PrivacyDecision } from "./types";

export function selectModelRoute(request: GatewayCompleteRequest, privacy: PrivacyDecision): ModelRoute {
  if (privacy.route_selected === "campus_local") {
    return {
      provider: "campus_local_mock",
      model: "campus-local-safety-v1",
      deployment: "campus_local",
      reason: privacy.reason
    };
  }

  if (request.model_preference === "deep" || request.purpose === "content_generation") {
    return {
      provider: "claude_mock",
      model: "claude-deep-mock",
      deployment: "controlled_cloud",
      reason: "deep_or_content_generation",
      fallback: {
        provider: "qianfan_mock",
        model: "qianfan-balanced-mock",
        deployment: "controlled_cloud"
      }
    };
  }

  return {
    provider: "qianfan_mock",
    model: "qianfan-fast-mock",
    deployment: "controlled_cloud",
    reason: "fast_default",
    fallback: {
      provider: "claude_mock",
      model: "claude-fast-mock",
      deployment: "controlled_cloud"
    }
  };
}
