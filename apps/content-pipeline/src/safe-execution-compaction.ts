export type SafeExecutionFollowUpArtifactKind =
  | "contract"
  | "plan"
  | "receipt"
  | "reconciliation";

export type SafeExecutionFollowUpDepthEncoding =
  | "base"
  | "delivery_chain"
  | "numeric_depth"
  | "non_follow_up"
  | "malformed";

export interface SafeExecutionCompactionOptions {
  compaction_depth_threshold?: number;
}

export interface SafeExecutionFollowUpModuleAnalysis {
  module_name: string;
  normalized_module_name: string;
  is_provider_follow_up: boolean;
  depth: number;
  artifact_kind: SafeExecutionFollowUpArtifactKind | null;
  depth_encoding: SafeExecutionFollowUpDepthEncoding;
  requires_compaction: boolean;
  issue_codes: SafeExecutionCompactionIssueCode[];
}

export interface SafeExecutionFollowUpModuleSummary {
  total_modules: number;
  provider_follow_up_modules: number;
  max_depth: number;
  modules_requiring_compaction: string[];
  malformed_modules: string[];
}

export type SafeExecutionCompactionIssueCode =
  | "not_provider_follow_up"
  | "mixed_depth_encodings"
  | "invalid_depth"
  | "depth_exceeds_compaction_threshold";

const PROVIDER_FOLLOW_UP_PREFIX = "provider-execution-follow-up";
const DELIVERY_FOLLOW_UP_SEGMENT = "delivery-follow-up";
const DEFAULT_COMPACTION_DEPTH_THRESHOLD = 10;

export function analyzeSafeExecutionFollowUpModuleName(
  moduleName: string,
  options: SafeExecutionCompactionOptions = {}
): SafeExecutionFollowUpModuleAnalysis {
  const threshold = options.compaction_depth_threshold ?? DEFAULT_COMPACTION_DEPTH_THRESHOLD;
  const normalizedModuleName = normalizeModuleName(moduleName);
  const issueCodes: SafeExecutionCompactionIssueCode[] = [];

  if (!normalizedModuleName.startsWith(PROVIDER_FOLLOW_UP_PREFIX)) {
    return {
      module_name: moduleName,
      normalized_module_name: normalizedModuleName,
      is_provider_follow_up: false,
      depth: 0,
      artifact_kind: null,
      depth_encoding: "non_follow_up",
      requires_compaction: false,
      issue_codes: ["not_provider_follow_up"],
    };
  }

  const { artifactKind, baseName } = stripArtifactKind(normalizedModuleName);
  const depthInfo = deriveFollowUpDepth(baseName);
  issueCodes.push(...depthInfo.issue_codes);

  const requiresCompaction =
    depthInfo.depth > threshold || issueCodes.includes("mixed_depth_encodings") || issueCodes.includes("invalid_depth");

  if (depthInfo.depth > threshold) {
    issueCodes.push("depth_exceeds_compaction_threshold");
  }

  return {
    module_name: moduleName,
    normalized_module_name: normalizedModuleName,
    is_provider_follow_up: true,
    depth: depthInfo.depth,
    artifact_kind: artifactKind,
    depth_encoding: depthInfo.depth_encoding,
    requires_compaction: requiresCompaction,
    issue_codes: issueCodes,
  };
}

export function summarizeSafeExecutionFollowUpModules(
  moduleNames: string[],
  options: SafeExecutionCompactionOptions = {}
): SafeExecutionFollowUpModuleSummary {
  const analyses = moduleNames.map((moduleName) => analyzeSafeExecutionFollowUpModuleName(moduleName, options));
  const providerFollowUpAnalyses = analyses.filter((analysis) => analysis.is_provider_follow_up);

  return {
    total_modules: moduleNames.length,
    provider_follow_up_modules: providerFollowUpAnalyses.length,
    max_depth: providerFollowUpAnalyses.reduce((maxDepth, analysis) => Math.max(maxDepth, analysis.depth), 0),
    modules_requiring_compaction: providerFollowUpAnalyses
      .filter((analysis) => analysis.requires_compaction)
      .map((analysis) => analysis.normalized_module_name),
    malformed_modules: providerFollowUpAnalyses
      .filter((analysis) => analysis.depth_encoding === "malformed")
      .map((analysis) => analysis.normalized_module_name),
  };
}

function normalizeModuleName(moduleName: string): string {
  const normalizedPath = moduleName.trim().replace(/\\/g, "/");
  const basename = normalizedPath.split("/").pop() ?? normalizedPath;
  return basename.replace(/\.ts$/, "");
}

function stripArtifactKind(moduleName: string): {
  artifactKind: SafeExecutionFollowUpArtifactKind;
  baseName: string;
} {
  for (const artifactKind of ["reconciliation", "receipt", "plan"] as const) {
    const suffix = `-${artifactKind}`;
    if (moduleName.endsWith(suffix)) {
      return {
        artifactKind,
        baseName: moduleName.slice(0, -suffix.length),
      };
    }
  }

  return {
    artifactKind: "contract",
    baseName: moduleName,
  };
}

function deriveFollowUpDepth(baseName: string): {
  depth: number;
  depth_encoding: SafeExecutionFollowUpDepthEncoding;
  issue_codes: SafeExecutionCompactionIssueCode[];
} {
  const remainder = baseName.slice(PROVIDER_FOLLOW_UP_PREFIX.length);
  const issueCodes: SafeExecutionCompactionIssueCode[] = [];

  if (remainder.length === 0) {
    return {
      depth: 1,
      depth_encoding: "base",
      issue_codes: [],
    };
  }

  const numericDepthMatch = remainder.match(/^-n(\d+)$/);
  if (numericDepthMatch) {
    const depthText = numericDepthMatch[1];
    if (depthText === undefined) {
      return {
        depth: 0,
        depth_encoding: "malformed",
        issue_codes: ["invalid_depth"],
      };
    }

    const depth = Number.parseInt(depthText, 10);
    return {
      depth,
      depth_encoding: depth >= 1 ? "numeric_depth" : "malformed",
      issue_codes: depth >= 1 ? [] : ["invalid_depth"],
    };
  }

  const deliverySegments = remainder.split(`-${DELIVERY_FOLLOW_UP_SEGMENT}`).filter((segment) => segment.length > 0);
  const isPureDeliveryChain = remainder.replace(new RegExp(`-${DELIVERY_FOLLOW_UP_SEGMENT}`, "g"), "").length === 0;

  if (isPureDeliveryChain) {
    const deliveryDepth = 1 + remainder.split(`-${DELIVERY_FOLLOW_UP_SEGMENT}`).length - 1;
    return {
      depth: deliveryDepth,
      depth_encoding: "delivery_chain",
      issue_codes: [],
    };
  }

  if (remainder.includes("-n") && remainder.includes(DELIVERY_FOLLOW_UP_SEGMENT)) {
    issueCodes.push("mixed_depth_encodings");
  } else if (deliverySegments.length > 0 || remainder.includes("-n")) {
    issueCodes.push("invalid_depth");
  }

  return {
    depth: 0,
    depth_encoding: "malformed",
    issue_codes: issueCodes.length > 0 ? issueCodes : ["invalid_depth"],
  };
}
