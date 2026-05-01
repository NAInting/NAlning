import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { runContentPipelineCli } from "../src/cli";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
} from "../src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpContract,
} from "../src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
} from "../src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp as buildFinalClosureRouting,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceContract as validateFinalClosureRoutingSourceContract,
} from "../src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
} from "../src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt,
} from "../src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation,
} from "../src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp as buildProviderExecutionFollowUpN13,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp as validateProviderExecutionFollowUpN13,
} from "../src/provider-execution-follow-up-n13";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan as buildProviderExecutionFollowUpN13Plan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan as validateProviderExecutionFollowUpN13Plan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanContract as validateProviderExecutionFollowUpN13PlanContract,
} from "../src/provider-execution-follow-up-n13-plan";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt as buildProviderExecutionFollowUpN13Receipt,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt as validateProviderExecutionFollowUpN13Receipt,
} from "../src/provider-execution-follow-up-n13-receipt";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation as buildProviderExecutionFollowUpN13Reconciliation,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation as validateProviderExecutionFollowUpN13Reconciliation,
} from "../src/provider-execution-follow-up-n13-reconciliation";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp as buildProviderExecutionFollowUpN14,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp as validateProviderExecutionFollowUpN14,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceContract as validateProviderExecutionFollowUpN14SourceContract,
} from "../src/provider-execution-follow-up-n14";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp as buildProviderExecutionFollowUpN15,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp as validateProviderExecutionFollowUpN15,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceContract as validateProviderExecutionFollowUpN15SourceContract,
} from "../src/provider-execution-follow-up-n15";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp as buildProviderExecutionFollowUpN16,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp as validateProviderExecutionFollowUpN16,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSource as validateProviderExecutionFollowUpN16Source,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceContract as validateProviderExecutionFollowUpN16SourceContract,
} from "../src/provider-execution-follow-up-n16";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp as buildProviderExecutionFollowUpN17,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp as validateProviderExecutionFollowUpN17,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSource as validateProviderExecutionFollowUpN17Source,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceContract as validateProviderExecutionFollowUpN17SourceContract,
} from "../src/provider-execution-follow-up-n17";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan as buildProviderExecutionFollowUpN17Plan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan as validateProviderExecutionFollowUpN17Plan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanContract as validateProviderExecutionFollowUpN17PlanContract,
} from "../src/provider-execution-follow-up-n17-plan";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt as buildProviderExecutionFollowUpN17Receipt,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt as validateProviderExecutionFollowUpN17Receipt,
} from "../src/provider-execution-follow-up-n17-receipt";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation as buildProviderExecutionFollowUpN17Reconciliation,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation as validateProviderExecutionFollowUpN17Reconciliation,
} from "../src/provider-execution-follow-up-n17-reconciliation";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan as buildProviderExecutionFollowUpN16Plan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan as validateProviderExecutionFollowUpN16Plan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanContract as validateProviderExecutionFollowUpN16PlanContract,
} from "../src/provider-execution-follow-up-n16-plan";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt as buildProviderExecutionFollowUpN16Receipt,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt as validateProviderExecutionFollowUpN16Receipt,
} from "../src/provider-execution-follow-up-n16-receipt";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation as buildProviderExecutionFollowUpN16Reconciliation,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation as validateProviderExecutionFollowUpN16Reconciliation,
} from "../src/provider-execution-follow-up-n16-reconciliation";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan as buildProviderExecutionFollowUpN14Plan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan as validateProviderExecutionFollowUpN14Plan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanContract as validateProviderExecutionFollowUpN14PlanContract,
} from "../src/provider-execution-follow-up-n14-plan";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt as buildProviderExecutionFollowUpN14Receipt,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt as validateProviderExecutionFollowUpN14Receipt,
} from "../src/provider-execution-follow-up-n14-receipt";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation as buildProviderExecutionFollowUpN14Reconciliation,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation as validateProviderExecutionFollowUpN14Reconciliation,
} from "../src/provider-execution-follow-up-n14-reconciliation";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan as buildProviderExecutionFollowUpN15Plan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan as validateProviderExecutionFollowUpN15Plan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanContract as validateProviderExecutionFollowUpN15PlanContract,
} from "../src/provider-execution-follow-up-n15-plan";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt as buildProviderExecutionFollowUpN15Receipt,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt as validateProviderExecutionFollowUpN15Receipt,
} from "../src/provider-execution-follow-up-n15-receipt";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation as buildProviderExecutionFollowUpN15Reconciliation,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation as validateProviderExecutionFollowUpN15Reconciliation,
} from "../src/provider-execution-follow-up-n15-reconciliation";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan } from "../src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation } from "../src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation";

function createMemoryIo(): {
  stdout: string[];
  stderr: string[];
  io: { stdout: (message: string) => void; stderr: (message: string) => void };
} {
  const stdout: string[] = [];
  const stderr: string[] = [];
  return {
    stdout,
    stderr,
    io: {
      stdout: (message: string) => stdout.push(message),
      stderr: (message: string) => stderr.push(message),
    },
  };
}

const deepCliStressIt =
  process.env.CONTENT_PIPELINE_DEEP_CLI_STRESS === "1" ? it : it.skip;

describe("provider execution follow-up delivery follow-up cli", () => {
  function makeLatestDownstreamPlan(
    overrides: Partial<UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan> =
      {}
  ): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan {
    return {
      schema_version:
        "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1",
      source_follow_up_schema_version:
        "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up/v0.1",
      request_key:
        "content-pipeline:provider-execution-request:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      chain_key:
        "content-pipeline:provider-execution-chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      attempt_key:
        "content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z",
      unit_id: "math_g8_linear_function_intro",
      follow_up_state: "manual_follow_up_item_delivered",
      follow_up_action: "none",
      follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed:
        true,
      preserved_result_artifact_handoff: null,
      preserved_active_follow_up_item: {
        item_key:
          "content-pipeline:manual_triage_queue:math_g8_linear_function_intro:provider-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up:content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z",
        human_queue: "manual_triage_queue",
        should_remain_open: true,
      },
      delivery_action: "none",
      final_follow_up_item_key:
        "content-pipeline:manual_triage_queue:math_g8_linear_function_intro:provider-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up:content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z",
      final_follow_up_queue: "manual_triage_queue",
      upsert: null,
      automation_step: "none",
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: false,
        provider_execution_allowed_without_human: false,
      },
      ...overrides,
    };
  }

  function makeLatestDownstreamReconciliation(
    plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
    overrides: Partial<UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation> =
      {}
  ): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation {
    return {
      schema_version:
        "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation/v0.1",
      source_follow_up_plan_schema_version: plan.schema_version,
      source_follow_up_receipt_schema_version:
        "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1",
      request_key: plan.request_key,
      chain_key: plan.chain_key,
      attempt_key: plan.attempt_key,
      unit_id: plan.unit_id,
      follow_up_state: plan.follow_up_state,
      follow_up_action: plan.follow_up_action,
      receipt_validation_ok: true,
      receipt_validation_issue_codes: [],
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      delivery_status: "applied",
      result_artifact_handoff: plan.preserved_result_artifact_handoff,
      preserved_active_follow_up_item: plan.preserved_active_follow_up_item,
      final_follow_up_item_key: plan.final_follow_up_item_key,
      final_follow_up_queue: plan.final_follow_up_queue,
      unresolved_operations: [],
      ...overrides,
    };
  }

  async function seedProviderExecutionFollowUpDeliveryChain(tempDir: string): Promise<{
    requestPath: string;
    decisionPath: string;
    attemptPath: string;
    sourceReceiptPath: string;
    sourceReconciliationPath: string;
    followUpPath: string;
    planPath: string;
    followUpReceiptPath: string;
    followUpReconciliationPath: string;
  }> {
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const decisionPath = join(tempDir, "review-provider-execution-decision.json");
    const attemptPath = join(tempDir, "review-provider-execution-attempt.json");
    const sourceReceiptPath = join(tempDir, "review-provider-execution-receipt.json");
    const sourceReconciliationPath = join(
      tempDir,
      "review-provider-execution-reconciliation.json"
    );
    const followUpPath = join(tempDir, "review-provider-execution-follow-up.json");
    const planPath = join(tempDir, "review-provider-execution-follow-up-plan.json");
    const followUpReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-receipt.json"
    );
    const followUpReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-reconciliation.json"
    );

    await writeFile(
      requestPath,
      `${JSON.stringify(
        {
          schema_version: "content-pipeline-review-provider-execution-request/v0.1",
          request_key:
            "content-pipeline:provider-execution-request:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          chain_key:
            "content-pipeline:provider-execution-chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          source_artifact_schema_version: "content-pipeline-review-artifact/v0.1",
          source_artifact_generated_at: "2026-04-23T18:00:00.000Z",
          source_artifact_status: "blocked",
          unit_id: "math_g8_linear_function_intro",
          execution_action: "run_scoped_review_rerun",
          requested_start_role: "assessment_designer",
          requested_roles: ["assessment_designer", "qa_agent"],
          estimated_provider_call_count: 2,
          review_mode: "llm_review_no_writeback",
          output_contract: "review_artifact_only",
          reason:
            "A review-only scoped rerun is structurally allowed, but it still requires an explicit decision before spending provider execution.",
          rerun_chain_depth: 0,
          rerun_root_artifact_generated_at: "2026-04-23T18:00:00.000Z",
          source_retry_decision: "allow_scoped_rerun",
          source_recommended_rerun_from: "assessment_designer",
          human_queue: "rerun_decision_queue",
          primary_human_action: "decide_scoped_rerun",
          inbox_title: "[Rerun Decision] math_g8_linear_function_intro",
          inbox_summary:
            "Blocked artifact can attempt a review-only scoped rerun from assessment_designer, but provider execution still requires an explicit human decision.",
          execution_command: {
            command: "run-llm-review",
            from_artifact_generated_at: "2026-04-23T18:00:00.000Z",
            rerun_from: "assessment_designer",
          },
          gating_requirements: {
            requires_explicit_human_approval: true,
            requires_budget_policy_check: true,
            requires_real_provider_credentials: true,
          },
          decision_boundary: {
            requires_provider_execution: true,
            requires_human_decision: true,
            provider_execution_allowed_without_human: false,
          },
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    await writeFile(
      decisionPath,
      `${JSON.stringify(
        {
          schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
          source_request_schema_version: "content-pipeline-review-provider-execution-request/v0.1",
          request_key:
            "content-pipeline:provider-execution-request:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          chain_key:
            "content-pipeline:provider-execution-chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          unit_id: "math_g8_linear_function_intro",
          execution_action: "run_scoped_review_rerun",
          requested_start_role: "assessment_designer",
          requested_roles: ["assessment_designer", "qa_agent"],
          estimated_provider_call_count: 2,
          human_queue: "rerun_decision_queue",
          primary_human_action: "decide_scoped_rerun",
          decision_status: "approved",
          execution_permission: "granted",
          reviewer_id: "ops_lead_001",
          reviewed_at: "2026-04-24T00:05:00.000Z",
          budget_check_status: "passed",
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    await writeFile(
      attemptPath,
      `${JSON.stringify(
        {
          schema_version: "content-pipeline-review-provider-execution-attempt/v0.1",
          source_request_schema_version: "content-pipeline-review-provider-execution-request/v0.1",
          source_decision_schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
          attempt_key:
            "content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z",
          request_key:
            "content-pipeline:provider-execution-request:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          chain_key:
            "content-pipeline:provider-execution-chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          unit_id: "math_g8_linear_function_intro",
          execution_action: "run_scoped_review_rerun",
          requested_start_role: "assessment_designer",
          requested_roles: ["assessment_designer", "qa_agent"],
          estimated_provider_call_count: 2,
          review_mode: "llm_review_no_writeback",
          output_contract: "review_artifact_only",
          execution_mode: "real_provider_review_rerun",
          attempt_status: "authorized_pending_execution",
          provider_execution_allowed: true,
          execution_command: {
            command: "run-llm-review",
            from_artifact_generated_at: "2026-04-23T18:00:00.000Z",
            rerun_from: "assessment_designer",
          },
          approved_by: "ops_lead_001",
          approved_at: "2026-04-24T00:05:00.000Z",
          budget_check_status: "passed",
          recorded_by: "automation_worker_001",
          recorded_at: "2026-04-24T00:10:00.000Z",
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    await writeFile(
      sourceReceiptPath,
      `${JSON.stringify(
        {
          schema_version: "content-pipeline-review-provider-execution-receipt/v0.1",
          source_request_schema_version: "content-pipeline-review-provider-execution-request/v0.1",
          source_decision_schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
          source_attempt_schema_version: "content-pipeline-review-provider-execution-attempt/v0.1",
          attempt_key:
            "content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z",
          request_key:
            "content-pipeline:provider-execution-request:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          chain_key:
            "content-pipeline:provider-execution-chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          unit_id: "math_g8_linear_function_intro",
          execution_action: "run_scoped_review_rerun",
          requested_start_role: "assessment_designer",
          requested_roles: ["assessment_designer", "qa_agent"],
          estimated_provider_call_count: 2,
          review_mode: "llm_review_no_writeback",
          output_contract: "review_artifact_only",
          execution_mode: "real_provider_review_rerun",
          attempt_status_at_execution: "authorized_pending_execution",
          receipt_status: "execution_failed",
          executed_by: "review_runner_001",
          executed_at: "2026-04-24T00:20:00.000Z",
          actual_provider_call_count: 1,
          result_artifact_schema_version: null,
          result_artifact_generated_at: null,
          result_artifact_status: null,
          failure_code: "provider_timeout",
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    await writeFile(
      sourceReconciliationPath,
      `${JSON.stringify(
        {
          schema_version: "content-pipeline-review-provider-execution-reconciliation/v0.1",
          source_request_schema_version: "content-pipeline-review-provider-execution-request/v0.1",
          source_decision_schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
          source_attempt_schema_version: "content-pipeline-review-provider-execution-attempt/v0.1",
          source_receipt_schema_version: "content-pipeline-review-provider-execution-receipt/v0.1",
          request_key:
            "content-pipeline:provider-execution-request:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          chain_key:
            "content-pipeline:provider-execution-chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          attempt_key:
            "content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z",
          unit_id: "math_g8_linear_function_intro",
          receipt_validation_ok: true,
          receipt_validation_issue_codes: [],
          reconciliation_status: "action_required",
          recommended_follow_up: "manual_execution_triage",
          execution_outcome: "execution_failed",
          result_artifact_available: false,
          result_artifact_generated_at: null,
          result_artifact_status: null,
          actual_provider_call_count: 1,
          executed_by: "review_runner_001",
          executed_at: "2026-04-24T00:20:00.000Z",
          failure_code: "provider_timeout",
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    const { io } = createMemoryIo();
    const renderFollowUpExitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up",
        requestPath,
        decisionPath,
        attemptPath,
        sourceReceiptPath,
        sourceReconciliationPath,
        "--out",
        followUpPath,
      ],
      io
    );
    if (renderFollowUpExitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up.");
    }

    const renderPlanExitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-plan",
        requestPath,
        decisionPath,
        attemptPath,
        sourceReceiptPath,
        sourceReconciliationPath,
        followUpPath,
        "--out",
        planPath,
      ],
      io
    );
    if (renderPlanExitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up plan.");
    }

    const renderFollowUpReceiptExitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-receipt",
        requestPath,
        decisionPath,
        attemptPath,
        sourceReceiptPath,
        sourceReconciliationPath,
        followUpPath,
        planPath,
        "--out",
        followUpReceiptPath,
      ],
      io
    );
    if (renderFollowUpReceiptExitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up receipt.");
    }

    const renderFollowUpReconciliationExitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-reconciliation",
        requestPath,
        decisionPath,
        attemptPath,
        sourceReceiptPath,
        sourceReconciliationPath,
        followUpPath,
        planPath,
        followUpReceiptPath,
        "--out",
        followUpReconciliationPath,
      ],
      io
    );
    if (renderFollowUpReconciliationExitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up reconciliation.");
    }

    return {
      requestPath,
      decisionPath,
      attemptPath,
      sourceReceiptPath,
      sourceReconciliationPath,
      followUpPath,
      planPath,
      followUpReceiptPath,
      followUpReconciliationPath,
    };
  }

  async function seedProviderExecutionFollowUpDeliveryFollowUpChain(
    tempDir: string
  ): Promise<{
    requestPath: string;
    decisionPath: string;
    attemptPath: string;
    sourceReceiptPath: string;
    sourceReconciliationPath: string;
    followUpPath: string;
    planPath: string;
    followUpReceiptPath: string;
    followUpReconciliationPath: string;
    followUpDeliveryFollowUpPath: string;
  }> {
    const seeded = await seedProviderExecutionFollowUpDeliveryChain(tempDir);
    const followUpDeliveryFollowUpPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up.json"
    );
    const { io } = createMemoryIo();
    const renderExitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        "--out",
        followUpDeliveryFollowUpPath,
      ],
      io
    );
    if (renderExitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up delivery follow-up.");
    }

    return {
      ...seeded,
      followUpDeliveryFollowUpPath,
    };
  }

  async function seedProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpChain(
    tempDir: string
  ): Promise<{
    requestPath: string;
    decisionPath: string;
    attemptPath: string;
    sourceReceiptPath: string;
    sourceReconciliationPath: string;
    followUpPath: string;
    planPath: string;
    followUpReceiptPath: string;
    followUpReconciliationPath: string;
    followUpDeliveryFollowUpPath: string;
    deliveryFollowUpPlanPath: string;
    deliveryFollowUpReceiptPath: string;
    deliveryFollowUpReconciliationPath: string;
    deliveryFollowUpDeliveryFollowUpPath: string;
  }> {
    const seeded = await seedProviderExecutionFollowUpDeliveryFollowUpChain(tempDir);
    const deliveryFollowUpPlanPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-plan.json"
    );
    const deliveryFollowUpReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-receipt.json"
    );
    const deliveryFollowUpReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-reconciliation.json"
    );
    const deliveryFollowUpDeliveryFollowUpPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up.json"
    );
    const { io } = createMemoryIo();

    let exitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up-plan",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        "--out",
        deliveryFollowUpPlanPath,
      ],
      io
    );
    if (exitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up delivery follow-up plan.");
    }

    exitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up-receipt",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        deliveryFollowUpPlanPath,
        "--out",
        deliveryFollowUpReceiptPath,
      ],
      io
    );
    if (exitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up delivery follow-up receipt.");
    }

    exitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up-reconciliation",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        deliveryFollowUpPlanPath,
        deliveryFollowUpReceiptPath,
        "--out",
        deliveryFollowUpReconciliationPath,
      ],
      io
    );
    if (exitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up delivery follow-up reconciliation.");
    }

    exitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        deliveryFollowUpPlanPath,
        deliveryFollowUpReceiptPath,
        deliveryFollowUpReconciliationPath,
        "--out",
        deliveryFollowUpDeliveryFollowUpPath,
      ],
      io
    );
    if (exitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up delivery follow-up delivery follow-up.");
    }

    return {
      ...seeded,
      deliveryFollowUpPlanPath,
      deliveryFollowUpReceiptPath,
      deliveryFollowUpReconciliationPath,
      deliveryFollowUpDeliveryFollowUpPath,
    };
  }

  async function seedProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpExecutorChain(
    tempDir: string
  ): Promise<{
    requestPath: string;
    decisionPath: string;
    attemptPath: string;
    sourceReceiptPath: string;
    sourceReconciliationPath: string;
    followUpPath: string;
    planPath: string;
    followUpReceiptPath: string;
    followUpReconciliationPath: string;
    followUpDeliveryFollowUpPath: string;
    deliveryFollowUpPlanPath: string;
    deliveryFollowUpReceiptPath: string;
    deliveryFollowUpReconciliationPath: string;
    deliveryFollowUpDeliveryFollowUpPath: string;
    deliveryFollowUpDeliveryFollowUpPlanPath: string;
    deliveryFollowUpDeliveryFollowUpReceiptPath: string;
    deliveryFollowUpDeliveryFollowUpReconciliationPath: string;
  }> {
    const seeded =
      await seedProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpChain(
        tempDir
      );
    const deliveryFollowUpDeliveryFollowUpPlanPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan.json"
    );
    const deliveryFollowUpDeliveryFollowUpReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-receipt.json"
    );
    const deliveryFollowUpDeliveryFollowUpReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation.json"
    );
    const { io } = createMemoryIo();

    let exitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpPlanPath,
        seeded.deliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpReconciliationPath,
        seeded.deliveryFollowUpDeliveryFollowUpPath,
        "--out",
        deliveryFollowUpDeliveryFollowUpPlanPath,
      ],
      io
    );
    if (exitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up delivery follow-up delivery follow-up plan.");
    }

    exitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-receipt",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpPlanPath,
        seeded.deliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpReconciliationPath,
        seeded.deliveryFollowUpDeliveryFollowUpPath,
        deliveryFollowUpDeliveryFollowUpPlanPath,
        "--out",
        deliveryFollowUpDeliveryFollowUpReceiptPath,
      ],
      io
    );
    if (exitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up delivery follow-up delivery follow-up receipt.");
    }

    exitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpPlanPath,
        seeded.deliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpReconciliationPath,
        seeded.deliveryFollowUpDeliveryFollowUpPath,
        deliveryFollowUpDeliveryFollowUpPlanPath,
        deliveryFollowUpDeliveryFollowUpReceiptPath,
        "--out",
        deliveryFollowUpDeliveryFollowUpReconciliationPath,
      ],
      io
    );
    if (exitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up delivery follow-up delivery follow-up reconciliation.");
    }

    return {
      ...seeded,
      deliveryFollowUpDeliveryFollowUpPlanPath,
      deliveryFollowUpDeliveryFollowUpReceiptPath,
      deliveryFollowUpDeliveryFollowUpReconciliationPath,
    };
  }

  async function seedProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpChain(
    tempDir: string
  ): Promise<{
    requestPath: string;
    decisionPath: string;
    attemptPath: string;
    sourceReceiptPath: string;
    sourceReconciliationPath: string;
    followUpPath: string;
    planPath: string;
    followUpReceiptPath: string;
    followUpReconciliationPath: string;
    followUpDeliveryFollowUpPath: string;
    deliveryFollowUpPlanPath: string;
    deliveryFollowUpReceiptPath: string;
    deliveryFollowUpReconciliationPath: string;
    deliveryFollowUpDeliveryFollowUpPath: string;
    deliveryFollowUpDeliveryFollowUpPlanPath: string;
    deliveryFollowUpDeliveryFollowUpReceiptPath: string;
    deliveryFollowUpDeliveryFollowUpReconciliationPath: string;
    deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath: string;
  }> {
    const seeded =
      await seedProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpExecutorChain(
        tempDir
      );
    const deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.json"
    );
    const { io } = createMemoryIo();

    const exitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpPlanPath,
        seeded.deliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpReconciliationPath,
        seeded.deliveryFollowUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
        seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
        "--out",
        deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath,
      ],
      io
    );
    if (exitCode !== 0) {
      throw new Error(
        "Failed to seed provider execution follow-up delivery follow-up delivery follow-up delivery follow-up."
      );
    }

    return {
      ...seeded,
      deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath,
    };
  }

  it("renders and validates provider execution follow-up delivery follow-up delivery follow-up delivery follow-up plan", async () => {
    const tempDir = await mkdtemp(
      join(
        tmpdir(),
        "content-pipeline-provider-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan-"
      )
    );
    const renderedPlanPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan.json"
    );
    const { stdout, stderr, io } = createMemoryIo();

    try {
      const seeded =
        await seedProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpChain(
          tempDir
        );

      let exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
          seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath,
          "--out",
          renderedPlanPath,
        ],
        io
      );
      const renderSummary = JSON.parse(stdout[0] ?? "{}");
      const renderedPlan = JSON.parse(await readFile(renderedPlanPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(renderSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
        follow_up_state: "manual_follow_up_item_delivered",
        delivery_action: "none",
        output_path: renderedPlanPath,
      });
      expect(renderedPlan).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1",
        follow_up_state: "manual_follow_up_item_delivered",
        delivery_action: "none",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
          seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath,
          renderedPlanPath,
        ],
        io
      );
      const validateSummary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(0);
      expect(validateSummary).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
        issue_count: 0,
      });
      expect(stderr).toEqual([]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 10000);

  it("renders and validates provider execution follow-up delivery follow-up delivery follow-up delivery follow-up receipt", async () => {
    const tempDir = await mkdtemp(
      join(
        tmpdir(),
        "content-pipeline-provider-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt-"
      )
    );
    const renderedPlanPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan.json"
    );
    const renderedReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt.json"
    );
    const { stdout, stderr, io } = createMemoryIo();

    try {
      const seeded =
        await seedProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpChain(
          tempDir
        );

      let exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
          seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath,
          "--out",
          renderedPlanPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
          seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath,
          renderedPlanPath,
          "--out",
          renderedReceiptPath,
        ],
        io
      );
      const renderSummary = JSON.parse(stdout[0] ?? "{}");
      const renderedReceipt = JSON.parse(await readFile(renderedReceiptPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(renderSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
        overall_status: "applied",
        output_path: renderedReceiptPath,
      });
      expect(renderedReceipt).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1",
        overall_status: "applied",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
          seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath,
          renderedPlanPath,
          renderedReceiptPath,
        ],
        io
      );
      const validateSummary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(0);
      expect(validateSummary).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
        issue_count: 0,
      });
      expect(stderr).toEqual([]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 10000);

  it("renders and validates provider execution follow-up delivery follow-up delivery follow-up delivery follow-up reconciliation", async () => {
    const tempDir = await mkdtemp(
      join(
        tmpdir(),
        "content-pipeline-provider-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation-"
      )
    );
    const renderedPlanPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan.json"
    );
    const renderedReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt.json"
    );
    const renderedReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation.json"
    );
    const { stdout, stderr, io } = createMemoryIo();

    try {
      const seeded =
        await seedProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpChain(
          tempDir
        );

      let exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
          seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath,
          "--out",
          renderedPlanPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
          seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath,
          renderedPlanPath,
          "--out",
          renderedReceiptPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
          seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath,
          renderedPlanPath,
          renderedReceiptPath,
          "--out",
          renderedReconciliationPath,
        ],
        io
      );
      const renderSummary = JSON.parse(stdout[0] ?? "{}");
      const renderedReconciliation = JSON.parse(
        await readFile(renderedReconciliationPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(renderSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
        reconciliation_status: "closed",
        recommended_follow_up: "none",
        output_path: renderedReconciliationPath,
      });
      expect(renderedReconciliation).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation/v0.1",
        reconciliation_status: "closed",
        recommended_follow_up: "none",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
          seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath,
          renderedPlanPath,
          renderedReceiptPath,
          renderedReconciliationPath,
        ],
        io
      );
      const validateSummary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(0);
      expect(validateSummary).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
        issue_count: 0,
      });
      expect(stderr).toEqual([]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  async function seedProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpExecutorChain(
    tempDir: string
  ): Promise<{
    requestPath: string;
    decisionPath: string;
    attemptPath: string;
    sourceReceiptPath: string;
    sourceReconciliationPath: string;
    followUpPath: string;
    planPath: string;
    followUpReceiptPath: string;
    followUpReconciliationPath: string;
    followUpDeliveryFollowUpPath: string;
    deliveryFollowUpPlanPath: string;
    deliveryFollowUpReceiptPath: string;
    deliveryFollowUpReconciliationPath: string;
    deliveryFollowUpDeliveryFollowUpPath: string;
    deliveryFollowUpDeliveryFollowUpPlanPath: string;
    deliveryFollowUpDeliveryFollowUpReceiptPath: string;
    deliveryFollowUpDeliveryFollowUpReconciliationPath: string;
    deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath: string;
    deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanPath: string;
    deliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptPath: string;
    deliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationPath: string;
  }> {
    const seeded =
      await seedProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpChain(
        tempDir
      );
    const deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan.json"
    );
    const deliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt.json"
    );
    const deliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation.json"
    );
    const { io } = createMemoryIo();

    let exitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpPlanPath,
        seeded.deliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpReconciliationPath,
        seeded.deliveryFollowUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
        seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
        seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath,
        "--out",
        deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanPath,
      ],
      io
    );
    if (exitCode !== 0) {
      throw new Error(
        "Failed to seed provider execution follow-up delivery follow-up delivery follow-up delivery follow-up plan."
      );
    }

    exitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpPlanPath,
        seeded.deliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpReconciliationPath,
        seeded.deliveryFollowUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
        seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
        seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath,
        deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanPath,
        "--out",
        deliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptPath,
      ],
      io
    );
    if (exitCode !== 0) {
      throw new Error(
        "Failed to seed provider execution follow-up delivery follow-up delivery follow-up delivery follow-up receipt."
      );
    }

    exitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpPlanPath,
        seeded.deliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpReconciliationPath,
        seeded.deliveryFollowUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
        seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
        seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath,
        deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanPath,
        deliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptPath,
        "--out",
        deliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationPath,
      ],
      io
    );
    if (exitCode !== 0) {
      throw new Error(
        "Failed to seed provider execution follow-up delivery follow-up delivery follow-up delivery follow-up reconciliation."
      );
    }

    return {
      ...seeded,
      deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanPath,
      deliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptPath,
      deliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationPath,
    };
  }

  it("renders and validates provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up", async () => {
    const tempDir = await mkdtemp(
      join(
        tmpdir(),
        "content-pipeline-provider-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-"
      )
    );
    const renderedFollowUpPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.json"
    );
    const { stdout, stderr, io } = createMemoryIo();

    try {
      const seeded =
        await seedProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpExecutorChain(
          tempDir
        );

      let exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
          seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanPath,
          seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationPath,
          "--out",
          renderedFollowUpPath,
        ],
        io
      );
      const renderSummary = JSON.parse(stdout[0] ?? "{}");
      const renderedFollowUp = JSON.parse(await readFile(renderedFollowUpPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(renderSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        follow_up_state: "manual_follow_up_item_delivered",
        follow_up_action: "none",
        output_path: renderedFollowUpPath,
      });
      expect(renderedFollowUp).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up/v0.1",
        follow_up_state: "manual_follow_up_item_delivered",
        follow_up_action: "none",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
          seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanPath,
          seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationPath,
          renderedFollowUpPath,
        ],
        io
      );
      const validateSummary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(0);
      expect(validateSummary).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        issue_count: 0,
      });
      expect(stderr).toEqual([]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders and validates provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up executor trio", async () => {
    const tempDir = await mkdtemp(
      join(
        tmpdir(),
        "content-pipeline-provider-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-executor-"
      )
    );
    const renderedFollowUpPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.json"
    );
    const renderedPlanPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan.json"
    );
    const renderedReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt.json"
    );
    const renderedReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation.json"
    );
    const { stdout, stderr, io } = createMemoryIo();

    try {
      const seeded =
        await seedProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpExecutorChain(
          tempDir
        );
      const sourceArgs = [
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpPlanPath,
        seeded.deliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpReconciliationPath,
        seeded.deliveryFollowUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
        seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
        seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanPath,
        seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationPath,
        renderedFollowUpPath,
      ];

      let exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...sourceArgs.slice(0, -1),
          "--out",
          renderedFollowUpPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...sourceArgs,
          "--out",
          renderedPlanPath,
        ],
        io
      );
      const planSummary = JSON.parse(stdout[0] ?? "{}");
      const renderedPlan = JSON.parse(await readFile(renderedPlanPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(planSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
        follow_up_state: "manual_follow_up_item_delivered",
        delivery_action: "none",
        output_path: renderedPlanPath,
      });
      expect(renderedPlan).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1",
        delivery_action: "none",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...sourceArgs,
          renderedPlanPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...sourceArgs,
          renderedPlanPath,
          "--out",
          renderedReceiptPath,
        ],
        io
      );
      const receiptSummary = JSON.parse(stdout[0] ?? "{}");
      const renderedReceipt = JSON.parse(await readFile(renderedReceiptPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(receiptSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
        overall_status: "applied",
        operation_count: 0,
        output_path: renderedReceiptPath,
      });
      expect(renderedReceipt).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1",
        overall_status: "applied",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...sourceArgs,
          renderedPlanPath,
          renderedReceiptPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...sourceArgs,
          renderedPlanPath,
          renderedReceiptPath,
          "--out",
          renderedReconciliationPath,
        ],
        io
      );
      const reconciliationSummary = JSON.parse(stdout[0] ?? "{}");
      const renderedReconciliation = JSON.parse(
        await readFile(renderedReconciliationPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(reconciliationSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
        reconciliation_status: "closed",
        recommended_follow_up: "none",
        output_path: renderedReconciliationPath,
      });
      expect(renderedReconciliation).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation/v0.1",
        reconciliation_status: "closed",
        recommended_follow_up: "none",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...sourceArgs,
          renderedPlanPath,
          renderedReceiptPath,
          renderedReconciliationPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
        issue_count: 0,
      });
      expect(stderr).toEqual([]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  deepCliStressIt("renders and validates provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up", async () => {
    const tempDir = await mkdtemp(
      join(
        tmpdir(),
        "content-pipeline-provider-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-"
      )
    );
    const latestFollowUpPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.json"
    );
    const latestPlanPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan.json"
    );
    const latestReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt.json"
    );
    const latestReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation.json"
    );
    const renderedFollowUpPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.json"
    );
    const renderedPlanPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan.json"
    );
    const renderedReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt.json"
    );
    const renderedReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation.json"
    );
    const malformedReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt.malformed.json"
    );
    const malformedReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation.malformed.json"
    );
    const nextRoutingPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.json"
    );
    const nextPlanPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan.json"
    );
    const nextReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt.json"
    );
    const nextReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation.json"
    );
    const malformedNextPlanPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.malformed-plan.json"
    );
    const malformedNextReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.malformed-receipt.json"
    );
    const malformedNextReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.malformed-reconciliation.json"
    );
    const malformedNextRoutingPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.malformed.json"
    );
    const closureRoutingPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.json"
    );
    const closurePlanPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan.json"
    );
    const closureReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt.json"
    );
    const closureReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation.json"
    );
    const malformedClosureReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.malformed-receipt.json"
    );
    const malformedClosureReceiptReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.malformed-reconciliation.json"
    );
    const finalClosureRoutingPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.json"
    );
    const malformedFinalClosureRoutingPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.malformed.json"
    );
    const finalClosurePlanPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan.json"
    );
    const finalClosureReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt.json"
    );
    const finalClosureReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation.json"
    );
    const nextFinalClosureRoutingPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.json"
    );
    const nextFinalClosurePlanPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan.json"
    );
    const nextFinalClosureReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt.json"
    );
    const nextFinalClosureReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation.json"
    );
    const latestFinalClosureRoutingPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.json"
    );
    const latestFinalClosurePlanPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan.json"
    );
    const latestFinalClosureReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt.json"
    );
    const latestFinalClosureReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation.json"
    );
    const newestFinalClosureRoutingPath = join(
      tempDir,
      "n11-follow-up-routing.json"
    );
    const newestFinalClosurePlanPath = join(
      tempDir,
      "n11-follow-up-plan.json"
    );
    const newestFinalClosureReceiptPath = join(
      tempDir,
      "n11-follow-up-receipt.json"
    );
    const newestFinalClosureReconciliationPath = join(
      tempDir,
      "n11-follow-up-reconciliation.json"
    );
    const newestFinalClosureNextRoutingPath = join(
      tempDir,
      "n12-follow-up-routing.json"
    );
    const newestFinalClosureNextPlanPath = join(
      tempDir,
      "n12-follow-up-plan.json"
    );
    const newestFinalClosureNextReceiptPath = join(
      tempDir,
      "n12-follow-up-receipt.json"
    );
    const newestFinalClosureNextReconciliationPath = join(
      tempDir,
      "n12-follow-up-reconciliation.json"
    );
    const newestFinalClosureNextNextRoutingPath = join(
      tempDir,
      "n13-follow-up-routing.json"
    );
    const newestFinalClosureNextNextPlanPath = join(
      tempDir,
      "n13-follow-up-plan.json"
    );
    const newestFinalClosureNextNextReceiptPath = join(
      tempDir,
      "n13-follow-up-receipt.json"
    );
    const newestFinalClosureNextNextReconciliationPath = join(
      tempDir,
      "n13-follow-up-reconciliation.json"
    );
    const newestFinalClosureNextAppliedReceiptPath = join(
      tempDir,
      "n12-follow-up-receipt-applied.json"
    );
    const newestFinalClosureNextAppliedReconciliationPath = join(
      tempDir,
      "n12-follow-up-reconciliation-applied.json"
    );
    const newestFinalClosureNextNextDeliveredRoutingPath = join(
      tempDir,
      "n13-follow-up-routing-delivered.json"
    );
    const newestFinalClosureNextNextDeliveredPlanPath = join(
      tempDir,
      "n13-follow-up-plan-delivered.json"
    );
    const newestFinalClosureNextNextDeliveredReceiptPath = join(
      tempDir,
      "n13-follow-up-receipt-delivered.json"
    );
    const newestFinalClosureNextNextDeliveredReconciliationPath = join(
      tempDir,
      "n13-follow-up-reconciliation-delivered.json"
    );
    const malformedClosureRoutingPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.malformed.json"
    );
    const { stdout, stderr, io } = createMemoryIo();

    try {
      const seeded =
        await seedProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpExecutorChain(
          tempDir
        );
      const sourceArgsBase = [
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpPlanPath,
        seeded.deliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpReconciliationPath,
        seeded.deliveryFollowUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
        seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
        seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanPath,
        seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationPath,
      ];

      let exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...sourceArgsBase,
          "--out",
          latestFollowUpPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      const latestSourceArgs = [...sourceArgsBase, latestFollowUpPath];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...latestSourceArgs,
          "--out",
          latestPlanPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...latestSourceArgs,
          latestPlanPath,
          "--out",
          latestReceiptPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...latestSourceArgs,
          latestPlanPath,
          latestReceiptPath,
          "--out",
          latestReconciliationPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      const sourceArgs = [
        ...latestSourceArgs,
        latestPlanPath,
        latestReceiptPath,
        latestReconciliationPath,
      ];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...sourceArgs,
          "--out",
          renderedFollowUpPath,
        ],
        io
      );
      const renderSummary = JSON.parse(stdout[0] ?? "{}");
      const renderedFollowUp = JSON.parse(await readFile(renderedFollowUpPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(renderSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        follow_up_state: "manual_follow_up_item_delivered",
        follow_up_action: "none",
        output_path: renderedFollowUpPath,
      });
      expect(renderedFollowUp).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up/v0.1",
        follow_up_state: "manual_follow_up_item_delivered",
        follow_up_action: "none",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...sourceArgs,
          renderedFollowUpPath,
        ],
        io
      );
      const validateSummary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(0);
      expect(validateSummary).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        issue_count: 0,
      });

      const nextSourceArgs = [...sourceArgs, renderedFollowUpPath];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...nextSourceArgs,
          "--out",
          renderedPlanPath,
        ],
        io
      );
      const planSummary = JSON.parse(stdout[0] ?? "{}");
      const renderedPlan = JSON.parse(await readFile(renderedPlanPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(planSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
        follow_up_state: "manual_follow_up_item_delivered",
        delivery_action: "none",
        output_path: renderedPlanPath,
      });
      expect(renderedPlan).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1",
        delivery_action: "none",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...nextSourceArgs,
          renderedPlanPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...nextSourceArgs,
          renderedPlanPath,
          "--out",
          renderedReceiptPath,
        ],
        io
      );
      const receiptSummary = JSON.parse(stdout[0] ?? "{}");
      const renderedReceipt = JSON.parse(await readFile(renderedReceiptPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(receiptSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
        overall_status: "applied",
        operation_count: 0,
        output_path: renderedReceiptPath,
      });
      expect(renderedReceipt).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1",
        overall_status: "applied",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...nextSourceArgs,
          renderedPlanPath,
          renderedReceiptPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...nextSourceArgs,
          renderedPlanPath,
          renderedReceiptPath,
          "--out",
          renderedReconciliationPath,
        ],
        io
      );
      const reconciliationSummary = JSON.parse(stdout[0] ?? "{}");
      const renderedReconciliation = JSON.parse(
        await readFile(renderedReconciliationPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(reconciliationSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
        reconciliation_status: "closed",
        recommended_follow_up: "none",
        output_path: renderedReconciliationPath,
      });
      expect(renderedReconciliation).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation/v0.1",
        reconciliation_status: "closed",
        recommended_follow_up: "none",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...nextSourceArgs,
          renderedPlanPath,
          renderedReceiptPath,
          renderedReconciliationPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
        issue_count: 0,
      });

      const nextRoutingSourceArgs = [
        ...nextSourceArgs,
        renderedPlanPath,
        renderedReceiptPath,
        renderedReconciliationPath,
      ];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...nextRoutingSourceArgs,
          "--out",
          nextRoutingPath,
        ],
        io
      );
      const nextRoutingSummary = JSON.parse(stdout[0] ?? "{}");
      const nextRouting = JSON.parse(await readFile(nextRoutingPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(nextRoutingSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        follow_up_state: "manual_follow_up_item_delivered",
        follow_up_action: "none",
        output_path: nextRoutingPath,
      });
      expect(nextRouting).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up/v0.1",
        follow_up_state: "manual_follow_up_item_delivered",
        follow_up_action: "none",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...nextRoutingSourceArgs,
          nextRoutingPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        issue_count: 0,
      });

      const finalSourceArgs = [...nextRoutingSourceArgs, nextRoutingPath];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...finalSourceArgs,
          "--out",
          nextPlanPath,
        ],
        io
      );
      const nextPlanSummary = JSON.parse(stdout[0] ?? "{}");
      const nextPlan = JSON.parse(await readFile(nextPlanPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(nextPlanSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
        follow_up_state: "manual_follow_up_item_delivered",
        delivery_action: "none",
        output_path: nextPlanPath,
      });
      expect(nextPlan).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1",
        delivery_action: "none",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...finalSourceArgs,
          nextPlanPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...finalSourceArgs,
          nextPlanPath,
          "--out",
          nextReceiptPath,
        ],
        io
      );
      const nextReceiptSummary = JSON.parse(stdout[0] ?? "{}");
      const nextReceipt = JSON.parse(await readFile(nextReceiptPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(nextReceiptSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
        overall_status: "applied",
        operation_count: 0,
        output_path: nextReceiptPath,
      });
      expect(nextReceipt).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1",
        overall_status: "applied",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...finalSourceArgs,
          nextPlanPath,
          nextReceiptPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...finalSourceArgs,
          nextPlanPath,
          nextReceiptPath,
          "--out",
          nextReconciliationPath,
        ],
        io
      );
      const nextReconciliationSummary = JSON.parse(stdout[0] ?? "{}");
      const nextReconciliation = JSON.parse(
        await readFile(nextReconciliationPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(nextReconciliationSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
        reconciliation_status: "closed",
        recommended_follow_up: "none",
        output_path: nextReconciliationPath,
      });
      expect(nextReconciliation).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation/v0.1",
        reconciliation_status: "closed",
        recommended_follow_up: "none",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...finalSourceArgs,
          nextPlanPath,
          nextReceiptPath,
          nextReconciliationPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
        issue_count: 0,
      });

      const closureRoutingSourceArgs = [
        ...finalSourceArgs,
        nextPlanPath,
        nextReceiptPath,
        nextReconciliationPath,
      ];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...closureRoutingSourceArgs,
          "--out",
          closureRoutingPath,
        ],
        io
      );
      const closureRoutingSummary = JSON.parse(stdout[0] ?? "{}");
      const closureRouting = JSON.parse(await readFile(closureRoutingPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(closureRoutingSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        follow_up_state: "manual_follow_up_item_delivered",
        follow_up_action: "none",
        output_path: closureRoutingPath,
      });
      expect(closureRouting).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up/v0.1",
        follow_up_state: "manual_follow_up_item_delivered",
        follow_up_action: "none",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...closureRoutingSourceArgs,
          closureRoutingPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        issue_count: 0,
      });
      expect(() =>
        buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
          nextPlan,
          {
            ...nextReconciliation,
            request_key: "content-pipeline:forged:unrelated-reconciliation",
          }
        )
      ).toThrow(/source is invalid/);

      const closurePlanSourceArgs = [
        ...closureRoutingSourceArgs,
        closureRoutingPath,
      ];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...closurePlanSourceArgs,
          "--out",
          closurePlanPath,
        ],
        io
      );
      const closurePlanSummary = JSON.parse(stdout[0] ?? "{}");
      const closurePlan = JSON.parse(await readFile(closurePlanPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(closurePlanSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
        follow_up_state: "manual_follow_up_item_delivered",
        delivery_action: "none",
        output_path: closurePlanPath,
      });
      expect(closurePlan).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1",
        delivery_action: "none",
        upsert: null,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...closurePlanSourceArgs,
          closurePlanPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...closurePlanSourceArgs,
          closurePlanPath,
          "--out",
          closureReceiptPath,
        ],
        io
      );
      const closureReceiptSummary = JSON.parse(stdout[0] ?? "{}");
      const closureReceipt = JSON.parse(await readFile(closureReceiptPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(closureReceiptSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
        overall_status: "applied",
        operation_count: 0,
        output_path: closureReceiptPath,
      });
      expect(closureReceipt).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1",
        overall_status: "applied",
        operations: [],
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...closurePlanSourceArgs,
          closurePlanPath,
          closureReceiptPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...closurePlanSourceArgs,
          closurePlanPath,
          closureReceiptPath,
          "--out",
          closureReconciliationPath,
        ],
        io
      );
      const closureReconciliationSummary = JSON.parse(stdout[0] ?? "{}");
      const closureReconciliation = JSON.parse(
        await readFile(closureReconciliationPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(closureReconciliationSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
        reconciliation_status: "closed",
        recommended_follow_up: "none",
        output_path: closureReconciliationPath,
      });
      expect(closureReconciliation).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation/v0.1",
        receipt_validation_ok: true,
        reconciliation_status: "closed",
        recommended_follow_up: "none",
        delivery_status: "applied",
      });

      await writeFile(
        malformedClosureReceiptPath,
        `${JSON.stringify(
          {
            ...closureReceipt,
            final_follow_up_item_key:
              "content-pipeline:manual_triage_queue:forged-closure-target",
            final_follow_up_queue: "manual_triage_queue",
            operations: [
              {
                operation_key: "content-pipeline:forged:closure-operation",
                operation_type: "upsert",
                target_item_key:
                  "content-pipeline:manual_triage_queue:forged-closure-target",
                status: "skipped",
              },
            ],
          },
          null,
          2
        )}\n`
      );

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...closurePlanSourceArgs,
          closurePlanPath,
          malformedClosureReceiptPath,
          "--out",
          malformedClosureReceiptReconciliationPath,
        ],
        io
      );
      const malformedClosureReceiptReconciliation = JSON.parse(
        await readFile(malformedClosureReceiptReconciliationPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(malformedClosureReceiptReconciliation).toMatchObject({
        receipt_validation_ok: false,
        reconciliation_status: "action_required",
        recommended_follow_up: "manual_receipt_triage",
        delivery_status: null,
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
        unresolved_operations: [],
      });
      expect(
        malformedClosureReceiptReconciliation.receipt_validation_issue_codes
      ).toContain("invalid_operation_status");

      const finalClosureRoutingSourceArgs = [
        ...closurePlanSourceArgs,
        closurePlanPath,
        closureReceiptPath,
        closureReconciliationPath,
      ];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...finalClosureRoutingSourceArgs,
          "--out",
          finalClosureRoutingPath,
        ],
        io
      );
      const finalClosureRoutingSummary = JSON.parse(stdout[0] ?? "{}");
      const finalClosureRouting = JSON.parse(
        await readFile(finalClosureRoutingPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(finalClosureRoutingSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        follow_up_state: "manual_follow_up_item_delivered",
        follow_up_action: "none",
        output_path: finalClosureRoutingPath,
      });
      expect(finalClosureRouting).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up/v0.1",
        follow_up_state: "manual_follow_up_item_delivered",
        follow_up_action: "none",
        automation_step: "none",
        follow_up_item: null,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...finalClosureRoutingSourceArgs,
          finalClosureRoutingPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        issue_count: 0,
      });

      const malformedFinalClosureRoutingSourceArgs = [
        ...closurePlanSourceArgs,
        closurePlanPath,
        malformedClosureReceiptPath,
        malformedClosureReceiptReconciliationPath,
      ];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...malformedFinalClosureRoutingSourceArgs,
          "--out",
          malformedFinalClosureRoutingPath,
        ],
        io
      );
      const malformedFinalClosureRouting = JSON.parse(
        await readFile(malformedFinalClosureRoutingPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(malformedFinalClosureRouting).toMatchObject({
        follow_up_state: "receipt_triage_required",
        follow_up_action: "open_manual_receipt_triage_item",
        result_artifact_handoff: null,
        active_follow_up_item: {
          item_key: null,
          human_queue: null,
          should_remain_open: false,
        },
      });
      expect(malformedFinalClosureRouting.follow_up_item?.labels).toContain(
        "provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up"
      );
      expect(
        malformedFinalClosureRouting.follow_up_item?.labels.some(
          (label: string) =>
            label.startsWith("receipt_validation:") &&
            label.includes("invalid_operation_status")
        )
      ).toBe(true);

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...malformedFinalClosureRoutingSourceArgs,
          malformedFinalClosureRoutingPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        issue_count: 0,
      });

      await writeFile(
        malformedReceiptPath,
        `${JSON.stringify(
          {
            ...renderedReceipt,
            final_follow_up_item_key:
              "content-pipeline:manual_triage_queue:forged-latest-delivery-target",
            final_follow_up_queue: "manual_triage_queue",
            operations: [
              {
                operation_key: "content-pipeline:forged:latest-delivery-operation",
                operation_type: "upsert",
                target_item_key:
                  "content-pipeline:manual_triage_queue:forged-latest-delivery-target",
                status: "skipped",
              },
            ],
          },
          null,
          2
        )}\n`
      );

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...nextSourceArgs,
          renderedPlanPath,
          malformedReceiptPath,
          "--out",
          malformedReconciliationPath,
        ],
        io
      );
      const malformedReconciliationSummary = JSON.parse(stdout[0] ?? "{}");
      const malformedReconciliation = JSON.parse(
        await readFile(malformedReconciliationPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(malformedReconciliationSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
        reconciliation_status: "action_required",
        recommended_follow_up: "manual_receipt_triage",
        output_path: malformedReconciliationPath,
      });
      expect(malformedReconciliation.receipt_validation_ok).toBe(false);
      expect(malformedReconciliation.receipt_validation_issue_codes).toContain(
        "invalid_operation_status"
      );
      expect(malformedReconciliation).toMatchObject({
        delivery_status: null,
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
        unresolved_operations: [],
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...nextSourceArgs,
          renderedPlanPath,
          malformedReceiptPath,
          malformedReconciliationPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
        issue_count: 0,
      });
      const malformedRoutingSourceArgs = [
        ...nextSourceArgs,
        renderedPlanPath,
        malformedReceiptPath,
        malformedReconciliationPath,
      ];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...malformedRoutingSourceArgs,
          "--out",
          malformedNextRoutingPath,
        ],
        io
      );
      const malformedRoutingSummary = JSON.parse(stdout[0] ?? "{}");
      const malformedRouting = JSON.parse(
        await readFile(malformedNextRoutingPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(malformedRoutingSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        follow_up_state: "receipt_triage_required",
        follow_up_action: "open_manual_receipt_triage_item",
        output_path: malformedNextRoutingPath,
      });
      expect(malformedRouting).toMatchObject({
        follow_up_state: "receipt_triage_required",
        follow_up_action: "open_manual_receipt_triage_item",
        result_artifact_handoff: null,
        active_follow_up_item: {
          item_key: null,
          human_queue: null,
          should_remain_open: false,
        },
      });
      expect(
        malformedRouting.follow_up_item?.labels.some(
          (label: string) =>
            label.startsWith("receipt_validation:") &&
            label.includes("invalid_operation_status")
        )
      ).toBe(true);
      const forgedExtraLabelRouting = {
        ...malformedRouting,
        follow_up_item: {
          ...malformedRouting.follow_up_item,
          labels: [
            ...(malformedRouting.follow_up_item?.labels ?? []),
            "delivery_status:applied",
          ],
        },
      };
      const forgedExtraLabelValidation =
        validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpContract(
          forgedExtraLabelRouting
        );
      expect(forgedExtraLabelValidation.ok).toBe(false);
      expect(forgedExtraLabelValidation.issues.map((issue) => issue.code)).toContain(
        "follow_up_item_contract_mismatch"
      );

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...malformedRoutingSourceArgs,
          malformedNextRoutingPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        issue_count: 0,
      });

      const malformedFinalSourceArgs = [
        ...malformedRoutingSourceArgs,
        malformedNextRoutingPath,
      ];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...malformedFinalSourceArgs,
          "--out",
          malformedNextPlanPath,
        ],
        io
      );
      const malformedNextPlanSummary = JSON.parse(stdout[0] ?? "{}");
      expect(exitCode, JSON.stringify({ stdout, stderr })).toBe(0);
      const malformedNextPlan = JSON.parse(await readFile(malformedNextPlanPath, "utf8"));

      expect(malformedNextPlanSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
        follow_up_state: "receipt_triage_required",
        delivery_action: "create_follow_up_inbox_item",
        output_path: malformedNextPlanPath,
      });
      expect(malformedNextPlan).toMatchObject({
        delivery_action: "create_follow_up_inbox_item",
      });
      expect(malformedNextPlan.upsert?.labels).toContain(
        "provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up"
      );

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...malformedFinalSourceArgs,
          malformedNextPlanPath,
          "--upsert-status",
          "failed",
          "--out",
          malformedNextReceiptPath,
        ],
        io
      );
      const malformedNextReceiptSummary = JSON.parse(stdout[0] ?? "{}");
      const malformedNextReceipt = JSON.parse(
        await readFile(malformedNextReceiptPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(malformedNextReceiptSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
        overall_status: "failed",
        operation_count: 1,
        output_path: malformedNextReceiptPath,
      });
      expect(malformedNextReceipt).toMatchObject({
        overall_status: "failed",
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...malformedFinalSourceArgs,
          malformedNextPlanPath,
          malformedNextReceiptPath,
          "--out",
          malformedNextReconciliationPath,
        ],
        io
      );
      const malformedNextReconciliationSummary = JSON.parse(stdout[0] ?? "{}");
      const malformedNextReconciliation = JSON.parse(
        await readFile(malformedNextReconciliationPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(malformedNextReconciliationSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
        reconciliation_status: "action_required",
        output_path: malformedNextReconciliationPath,
      });
      expect(malformedNextReconciliation.recommended_follow_up).toBe(
        "manual_repair_provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up"
      );
      expect(malformedNextReconciliation.unresolved_operations).toHaveLength(1);

      const malformedClosureRoutingSourceArgs = [
        ...malformedFinalSourceArgs,
        malformedNextPlanPath,
        malformedNextReceiptPath,
        malformedNextReconciliationPath,
      ];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...malformedClosureRoutingSourceArgs,
          "--out",
          malformedClosureRoutingPath,
        ],
        io
      );
      const malformedClosureRoutingSummary = JSON.parse(stdout[0] ?? "{}");
      const malformedClosureRouting = JSON.parse(
        await readFile(malformedClosureRoutingPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(malformedClosureRoutingSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        follow_up_state:
          "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required",
        follow_up_action:
          "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_item",
        output_path: malformedClosureRoutingPath,
      });
      expect(malformedClosureRouting.follow_up_item?.labels).toContain(
        "provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up"
      );
      expect(malformedClosureRouting.follow_up_item?.item_key).toContain(
        "provider-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-repair"
      );

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...malformedClosureRoutingSourceArgs,
          malformedClosureRoutingPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        issue_count: 0,
      });

      const malformedClosurePlanSourceArgs = [
        ...malformedClosureRoutingSourceArgs,
        malformedClosureRoutingPath,
      ];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...malformedClosurePlanSourceArgs,
          "--out",
          closurePlanPath,
        ],
        io
      );
      const repairClosurePlan = JSON.parse(await readFile(closurePlanPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(repairClosurePlan).toMatchObject({
        follow_up_state:
          "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required",
        delivery_action: "create_follow_up_inbox_item",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...malformedClosurePlanSourceArgs,
          closurePlanPath,
          "--upsert-status",
          "failed",
          "--out",
          closureReceiptPath,
        ],
        io
      );
      const repairClosureReceipt = JSON.parse(
        await readFile(closureReceiptPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(repairClosureReceipt).toMatchObject({
        overall_status: "failed",
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...malformedClosurePlanSourceArgs,
          closurePlanPath,
          closureReceiptPath,
          "--out",
          closureReconciliationPath,
        ],
        io
      );
      const repairClosureReconciliation = JSON.parse(
        await readFile(closureReconciliationPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(repairClosureReconciliation).toMatchObject({
        receipt_validation_ok: true,
        reconciliation_status: "action_required",
        recommended_follow_up:
          "manual_repair_provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up",
      });
      expect(repairClosureReconciliation.unresolved_operations).toHaveLength(1);

      const repairFinalClosureRoutingSourceArgs = [
        ...malformedClosurePlanSourceArgs,
        closurePlanPath,
        closureReceiptPath,
        closureReconciliationPath,
      ];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...repairFinalClosureRoutingSourceArgs,
          "--out",
          malformedFinalClosureRoutingPath,
        ],
        io
      );
      const repairFinalClosureRouting = JSON.parse(
        await readFile(malformedFinalClosureRoutingPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(repairFinalClosureRouting).toMatchObject({
        follow_up_state:
          "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required",
        follow_up_action:
          "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_item",
        automation_step: "open_inbox_item",
      });
      expect(repairFinalClosureRouting.follow_up_item?.labels).toContain(
        "provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up"
      );
      expect(repairFinalClosureRouting.follow_up_item?.item_key).toContain(
        "provider-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-repair"
      );

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...repairFinalClosureRoutingSourceArgs,
          malformedFinalClosureRoutingPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        issue_count: 0,
      });

      const finalClosurePlanSourceArgs = [
        ...repairFinalClosureRoutingSourceArgs,
        malformedFinalClosureRoutingPath,
      ];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...finalClosurePlanSourceArgs,
          "--out",
          finalClosurePlanPath,
        ],
        io
      );
      const finalClosurePlan = JSON.parse(
        await readFile(finalClosurePlanPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(finalClosurePlan).toMatchObject({
        follow_up_state:
          "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required",
        delivery_action: "create_follow_up_inbox_item",
      });
      expect(finalClosurePlan.upsert.operation_key).toContain(
        "provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up:upsert:"
      );

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...finalClosurePlanSourceArgs,
          finalClosurePlanPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...finalClosurePlanSourceArgs,
          finalClosurePlanPath,
          "--upsert-status",
          "failed",
          "--out",
          finalClosureReceiptPath,
        ],
        io
      );
      const finalClosureReceipt = JSON.parse(
        await readFile(finalClosureReceiptPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(finalClosureReceipt).toMatchObject({
        overall_status: "failed",
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...finalClosurePlanSourceArgs,
          finalClosurePlanPath,
          finalClosureReceiptPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...finalClosurePlanSourceArgs,
          finalClosurePlanPath,
          finalClosureReceiptPath,
          "--out",
          finalClosureReconciliationPath,
        ],
        io
      );
      const finalClosureReconciliation = JSON.parse(
        await readFile(finalClosureReconciliationPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(finalClosureReconciliation).toMatchObject({
        receipt_validation_ok: true,
        reconciliation_status: "action_required",
        recommended_follow_up:
          "manual_repair_provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up",
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
      });
      expect(finalClosureReconciliation.unresolved_operations).toHaveLength(1);

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...finalClosurePlanSourceArgs,
          finalClosurePlanPath,
          finalClosureReceiptPath,
          finalClosureReconciliationPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      const nextFinalClosureRoutingSourceArgs = [
        ...finalClosurePlanSourceArgs,
        finalClosurePlanPath,
        finalClosureReceiptPath,
        finalClosureReconciliationPath,
      ];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...nextFinalClosureRoutingSourceArgs,
          "--out",
          nextFinalClosureRoutingPath,
        ],
        io
      );
      const nextFinalClosureRouting = JSON.parse(
        await readFile(nextFinalClosureRoutingPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(nextFinalClosureRouting).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up/v0.1",
        follow_up_state:
          "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required",
        follow_up_action:
          "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_item",
        automation_step: "open_inbox_item",
        result_artifact_handoff: null,
        active_follow_up_item: {
          item_key: null,
          human_queue: null,
          should_remain_open: false,
        },
      });
      expect(nextFinalClosureRouting.follow_up_item?.labels).toContain(
        "provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up"
      );

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...nextFinalClosureRoutingSourceArgs,
          nextFinalClosureRoutingPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      const nextFinalClosurePlanSourceArgs = [
        ...nextFinalClosureRoutingSourceArgs,
        nextFinalClosureRoutingPath,
      ];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...nextFinalClosurePlanSourceArgs,
          "--out",
          nextFinalClosurePlanPath,
        ],
        io
      );
      const nextFinalClosurePlan = JSON.parse(
        await readFile(nextFinalClosurePlanPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(nextFinalClosurePlan).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1",
        source_follow_up_schema_version: nextFinalClosureRouting.schema_version,
        follow_up_state: nextFinalClosureRouting.follow_up_state,
        delivery_action: "create_follow_up_inbox_item",
      });
      expect(nextFinalClosurePlan.upsert.operation_key).toContain(
        "provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up:upsert:"
      );

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...nextFinalClosurePlanSourceArgs,
          nextFinalClosurePlanPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...nextFinalClosurePlanSourceArgs,
          nextFinalClosurePlanPath,
          "--upsert-status",
          "failed",
          "--out",
          nextFinalClosureReceiptPath,
        ],
        io
      );
      const nextFinalClosureReceipt = JSON.parse(
        await readFile(nextFinalClosureReceiptPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(nextFinalClosureReceipt).toMatchObject({
        source_follow_up_plan_schema_version: nextFinalClosurePlan.schema_version,
        overall_status: "failed",
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...nextFinalClosurePlanSourceArgs,
          nextFinalClosurePlanPath,
          nextFinalClosureReceiptPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...nextFinalClosurePlanSourceArgs,
          nextFinalClosurePlanPath,
          nextFinalClosureReceiptPath,
          "--out",
          nextFinalClosureReconciliationPath,
        ],
        io
      );
      const nextFinalClosureReconciliation = JSON.parse(
        await readFile(nextFinalClosureReconciliationPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(nextFinalClosureReconciliation).toMatchObject({
        source_follow_up_plan_schema_version: nextFinalClosurePlan.schema_version,
        source_follow_up_receipt_schema_version: nextFinalClosureReceipt.schema_version,
        receipt_validation_ok: true,
        reconciliation_status: "action_required",
        recommended_follow_up:
          "manual_repair_provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up",
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
      });
      expect(nextFinalClosureReconciliation.unresolved_operations).toHaveLength(1);

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...nextFinalClosurePlanSourceArgs,
          nextFinalClosurePlanPath,
          nextFinalClosureReceiptPath,
          nextFinalClosureReconciliationPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      const latestFinalClosureRoutingSourceArgs = [
        ...nextFinalClosurePlanSourceArgs,
        nextFinalClosurePlanPath,
        nextFinalClosureReceiptPath,
        nextFinalClosureReconciliationPath,
      ];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...latestFinalClosureRoutingSourceArgs,
          "--out",
          latestFinalClosureRoutingPath,
        ],
        io
      );
      const latestFinalClosureRouting = JSON.parse(
        await readFile(latestFinalClosureRoutingPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(latestFinalClosureRouting).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up/v0.1",
        source_follow_up_plan_schema_version: nextFinalClosurePlan.schema_version,
        source_follow_up_reconciliation_schema_version:
          nextFinalClosureReconciliation.schema_version,
        source_follow_up_state: nextFinalClosurePlan.follow_up_state,
        source_follow_up_action: nextFinalClosurePlan.follow_up_action,
        source_reconciliation_status:
          nextFinalClosureReconciliation.reconciliation_status,
        source_recommended_follow_up:
          nextFinalClosureReconciliation.recommended_follow_up,
    source_delivery_status: nextFinalClosureReconciliation.delivery_status,
    follow_up_state:
      "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required",
    follow_up_action:
      "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_item",
    automation_step: "open_inbox_item",
        decision_boundary: {
          requires_provider_execution: false,
          requires_human_decision: true,
          provider_execution_allowed_without_human: false,
        },
      });
  expect(latestFinalClosureRouting.follow_up_item?.item_key).toContain(
    "provider-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-repair:"
  );
  expect(latestFinalClosureRouting.follow_up_item?.labels).toContain(
    "follow_up_state:repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required"
  );

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...latestFinalClosureRoutingSourceArgs,
          latestFinalClosureRoutingPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...latestFinalClosureRoutingSourceArgs,
          latestFinalClosureRoutingPath,
          "--out",
          latestFinalClosurePlanPath,
        ],
        io
      );
      const latestFinalClosurePlan = JSON.parse(
        await readFile(latestFinalClosurePlanPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(latestFinalClosurePlan).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1",
        source_follow_up_schema_version: latestFinalClosureRouting.schema_version,
        follow_up_state: latestFinalClosureRouting.follow_up_state,
        delivery_action: "create_follow_up_inbox_item",
      });
      expect(latestFinalClosurePlan.upsert?.operation_key).toContain(
        "provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up:upsert:"
      );

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...latestFinalClosureRoutingSourceArgs,
          latestFinalClosureRoutingPath,
          latestFinalClosurePlanPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...latestFinalClosureRoutingSourceArgs,
          latestFinalClosureRoutingPath,
          latestFinalClosurePlanPath,
          "--upsert-status",
          "failed",
          "--executed-at",
          "2026-04-24T01:40:00.000Z",
          "--out",
          latestFinalClosureReceiptPath,
        ],
        io
      );
      const latestFinalClosureReceipt = JSON.parse(
        await readFile(latestFinalClosureReceiptPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(latestFinalClosureReceipt).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1",
        source_follow_up_plan_schema_version: latestFinalClosurePlan.schema_version,
        overall_status: "failed",
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
      });
      expect(latestFinalClosureReceipt.operations).toHaveLength(1);

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...latestFinalClosureRoutingSourceArgs,
          latestFinalClosureRoutingPath,
          latestFinalClosurePlanPath,
          latestFinalClosureReceiptPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...latestFinalClosureRoutingSourceArgs,
          latestFinalClosureRoutingPath,
          latestFinalClosurePlanPath,
          latestFinalClosureReceiptPath,
          "--out",
          latestFinalClosureReconciliationPath,
        ],
        io
      );
      const latestFinalClosureReconciliation = JSON.parse(
        await readFile(latestFinalClosureReconciliationPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(latestFinalClosureReconciliation).toMatchObject({
        source_follow_up_plan_schema_version: latestFinalClosurePlan.schema_version,
        source_follow_up_receipt_schema_version:
          latestFinalClosureReceipt.schema_version,
        receipt_validation_ok: true,
        reconciliation_status: "action_required",
        recommended_follow_up:
          "manual_repair_provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up",
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
      });
      expect(latestFinalClosureReconciliation.unresolved_operations).toHaveLength(1);

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...latestFinalClosureRoutingSourceArgs,
          latestFinalClosureRoutingPath,
          latestFinalClosurePlanPath,
          latestFinalClosureReceiptPath,
          latestFinalClosureReconciliationPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });
      const newestFinalClosureRoutingSourceArgs = [
        ...latestFinalClosureRoutingSourceArgs,
        latestFinalClosureRoutingPath,
        latestFinalClosurePlanPath,
        latestFinalClosureReceiptPath,
        latestFinalClosureReconciliationPath,
      ];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...newestFinalClosureRoutingSourceArgs,
          "--out",
          newestFinalClosureRoutingPath,
        ],
        io
      );
      const newestFinalClosureRouting = JSON.parse(
        await readFile(newestFinalClosureRoutingPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(newestFinalClosureRouting).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up/v0.1",
        source_follow_up_plan_schema_version: latestFinalClosurePlan.schema_version,
        source_follow_up_reconciliation_schema_version:
          latestFinalClosureReconciliation.schema_version,
        source_follow_up_state: latestFinalClosurePlan.follow_up_state,
        source_follow_up_action: latestFinalClosurePlan.follow_up_action,
        source_reconciliation_status:
          latestFinalClosureReconciliation.reconciliation_status,
        source_recommended_follow_up:
          latestFinalClosureReconciliation.recommended_follow_up,
        source_delivery_status: latestFinalClosureReconciliation.delivery_status,
        follow_up_state:
          "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required",
        follow_up_action:
          "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_item",
        automation_step: "open_inbox_item",
        decision_boundary: {
          requires_provider_execution: false,
          requires_human_decision: true,
          provider_execution_allowed_without_human: false,
        },
      });
      expect(newestFinalClosureRouting.follow_up_item?.item_key).toContain(
        "provider-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-repair:"
      );
      expect(
        newestFinalClosureRouting.follow_up_item?.title.match(/Delivery Follow-up/g)
      ).toHaveLength(11);
      expect(newestFinalClosureRouting.follow_up_item?.labels).toContain(
        "follow_up_state:repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required"
      );

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...newestFinalClosureRoutingSourceArgs,
          newestFinalClosureRoutingPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      const newestFinalClosureTrioSourceArgs = [
        ...newestFinalClosureRoutingSourceArgs,
        newestFinalClosureRoutingPath,
      ];
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...newestFinalClosureTrioSourceArgs,
          "--out",
          newestFinalClosurePlanPath,
        ],
        io
      );
      const newestFinalClosurePlan = JSON.parse(
        await readFile(newestFinalClosurePlanPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(newestFinalClosurePlan).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1",
        source_follow_up_schema_version: newestFinalClosureRouting.schema_version,
        follow_up_state: newestFinalClosureRouting.follow_up_state,
        delivery_action: "create_follow_up_inbox_item",
        final_follow_up_item_key:
          newestFinalClosureRouting.follow_up_item?.item_key,
        final_follow_up_queue:
          newestFinalClosureRouting.follow_up_item?.human_queue,
        automation_step: "open_inbox_item",
      });
      expect(newestFinalClosurePlan.upsert?.operation_key).toContain(
        "provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up:upsert:"
      );
      expect(newestFinalClosurePlan.upsert?.item_key).toBe(
        newestFinalClosureRouting.follow_up_item?.item_key
      );

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan",
          ...newestFinalClosureTrioSourceArgs,
          newestFinalClosurePlanPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...newestFinalClosureTrioSourceArgs,
          newestFinalClosurePlanPath,
          "--upsert-status",
          "failed",
          "--out",
          newestFinalClosureReceiptPath,
        ],
        io
      );
      if (exitCode !== 0) {
        throw new Error(stderr.join("\n"));
      }
      const newestFinalClosureReceipt = JSON.parse(
        await readFile(newestFinalClosureReceiptPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(newestFinalClosureReceipt).toMatchObject({
        source_follow_up_plan_schema_version: newestFinalClosurePlan.schema_version,
        overall_status: "failed",
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
      });
      expect(newestFinalClosureReceipt.operations).toHaveLength(1);
      expect(newestFinalClosureReceipt.operations[0]).toMatchObject({
        operation_key: newestFinalClosurePlan.upsert?.operation_key,
        operation_type: "upsert",
        target_item_key: newestFinalClosurePlan.upsert?.item_key,
        status: "failed",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          ...newestFinalClosureTrioSourceArgs,
          newestFinalClosurePlanPath,
          newestFinalClosureReceiptPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...newestFinalClosureTrioSourceArgs,
          newestFinalClosurePlanPath,
          newestFinalClosureReceiptPath,
          "--out",
          newestFinalClosureReconciliationPath,
        ],
        io
      );
      const newestFinalClosureReconciliation = JSON.parse(
        await readFile(newestFinalClosureReconciliationPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(newestFinalClosureReconciliation).toMatchObject({
        source_follow_up_plan_schema_version: newestFinalClosurePlan.schema_version,
        source_follow_up_receipt_schema_version:
          newestFinalClosureReceipt.schema_version,
        receipt_validation_ok: true,
        reconciliation_status: "action_required",
        recommended_follow_up:
          "manual_repair_provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up",
        delivery_status: "failed",
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
      });
      expect(newestFinalClosureReconciliation.unresolved_operations).toHaveLength(1);

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          ...newestFinalClosureTrioSourceArgs,
          newestFinalClosurePlanPath,
          newestFinalClosureReceiptPath,
          newestFinalClosureReconciliationPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      const newestFinalClosureNextRoutingSourceArgs = [
        ...newestFinalClosureTrioSourceArgs,
        newestFinalClosurePlanPath,
        newestFinalClosureReceiptPath,
        newestFinalClosureReconciliationPath,
      ];
      const newestFinalClosureNextRoutingRepairState =
        "repair_follow_up" + "_delivery_follow_up".repeat(11) + "_required";
      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...newestFinalClosureNextRoutingSourceArgs,
          "--out",
          newestFinalClosureNextRoutingPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      const newestFinalClosureNextRouting = JSON.parse(
        await readFile(newestFinalClosureNextRoutingPath, "utf8")
      );
      expect(newestFinalClosureNextRouting).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up/v0.1",
        source_follow_up_plan_schema_version: newestFinalClosurePlan.schema_version,
        source_follow_up_reconciliation_schema_version:
          newestFinalClosureReconciliation.schema_version,
        source_reconciliation_status:
          newestFinalClosureReconciliation.reconciliation_status,
        source_recommended_follow_up:
          newestFinalClosureReconciliation.recommended_follow_up,
        source_delivery_status: newestFinalClosureReconciliation.delivery_status,
        follow_up_state: newestFinalClosureNextRoutingRepairState,
        follow_up_action:
          "open_manual_repair_follow_up" +
          "_delivery_follow_up".repeat(11) +
          "_item",
        automation_step: "open_inbox_item",
        result_artifact_handoff: null,
        active_follow_up_item: {
          item_key: null,
          human_queue: null,
          should_remain_open: false,
        },
      });
      expect(newestFinalClosureNextRouting.follow_up_item?.item_key).toContain(
        "provider-follow-up" + "-delivery-follow-up".repeat(12) + "-repair:"
      );
      expect(
        newestFinalClosureNextRouting.follow_up_item?.title.match(/Delivery Follow-up/g)
      ).toHaveLength(12);
      expect(newestFinalClosureNextRouting.follow_up_item?.labels).toContain(
        `follow_up_state:${newestFinalClosureNextRoutingRepairState}`
      );

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          ...newestFinalClosureNextRoutingSourceArgs,
          newestFinalClosureNextRoutingPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      const newestFinalClosureNextCommandBase =
        "provider-execution-follow-up" + "-delivery-follow-up".repeat(12);
      const newestFinalClosureNextSchemaBase =
        `content-pipeline-review-${newestFinalClosureNextCommandBase}`;
      const newestFinalClosureNextTrioSourceArgs = [
        ...newestFinalClosureNextRoutingSourceArgs,
        newestFinalClosureNextRoutingPath,
      ];

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          `render-review-${newestFinalClosureNextCommandBase}-plan`,
          ...newestFinalClosureNextTrioSourceArgs,
          "--out",
          newestFinalClosureNextPlanPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      const newestFinalClosureNextPlan = JSON.parse(
        await readFile(newestFinalClosureNextPlanPath, "utf8")
      );
      expect(newestFinalClosureNextPlan).toMatchObject({
        schema_version: `${newestFinalClosureNextSchemaBase}-plan/v0.1`,
        source_follow_up_schema_version:
          newestFinalClosureNextRouting.schema_version,
        follow_up_state: newestFinalClosureNextRouting.follow_up_state,
        delivery_action: "create_follow_up_inbox_item",
        final_follow_up_item_key:
          newestFinalClosureNextRouting.follow_up_item?.item_key,
        final_follow_up_queue:
          newestFinalClosureNextRouting.follow_up_item?.human_queue,
        automation_step: "open_inbox_item",
      });
      expect(newestFinalClosureNextPlan.upsert?.operation_key).toContain(
        `${newestFinalClosureNextCommandBase}:upsert:`
      );
      expect(newestFinalClosureNextPlan.upsert?.item_key).toBe(
        newestFinalClosureNextRouting.follow_up_item?.item_key
      );

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          `validate-review-${newestFinalClosureNextCommandBase}-plan`,
          ...newestFinalClosureNextTrioSourceArgs,
          newestFinalClosureNextPlanPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          `render-review-${newestFinalClosureNextCommandBase}-receipt`,
          ...newestFinalClosureNextTrioSourceArgs,
          newestFinalClosureNextPlanPath,
          "--upsert-status",
          "failed",
          "--executed-at",
          "2026-04-24T02:00:00.000Z",
          "--out",
          newestFinalClosureNextReceiptPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      const newestFinalClosureNextReceipt = JSON.parse(
        await readFile(newestFinalClosureNextReceiptPath, "utf8")
      );
      expect(newestFinalClosureNextReceipt).toMatchObject({
        schema_version: `${newestFinalClosureNextSchemaBase}-receipt/v0.1`,
        source_follow_up_plan_schema_version:
          newestFinalClosureNextPlan.schema_version,
        overall_status: "failed",
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
      });
      expect(newestFinalClosureNextReceipt.operations).toHaveLength(1);
      expect(newestFinalClosureNextReceipt.operations[0]).toMatchObject({
        operation_key: newestFinalClosureNextPlan.upsert?.operation_key,
        operation_type: "upsert",
        target_item_key: newestFinalClosureNextPlan.upsert?.item_key,
        status: "failed",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          `validate-review-${newestFinalClosureNextCommandBase}-receipt`,
          ...newestFinalClosureNextTrioSourceArgs,
          newestFinalClosureNextPlanPath,
          newestFinalClosureNextReceiptPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          `render-review-${newestFinalClosureNextCommandBase}-reconciliation`,
          ...newestFinalClosureNextTrioSourceArgs,
          newestFinalClosureNextPlanPath,
          newestFinalClosureNextReceiptPath,
          "--out",
          newestFinalClosureNextReconciliationPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      const newestFinalClosureNextReconciliation = JSON.parse(
        await readFile(newestFinalClosureNextReconciliationPath, "utf8")
      );
      expect(newestFinalClosureNextReconciliation).toMatchObject({
        schema_version: `${newestFinalClosureNextSchemaBase}-reconciliation/v0.1`,
        source_follow_up_plan_schema_version:
          newestFinalClosureNextPlan.schema_version,
        source_follow_up_receipt_schema_version:
          newestFinalClosureNextReceipt.schema_version,
        receipt_validation_ok: true,
        reconciliation_status: "action_required",
        recommended_follow_up:
          "manual_repair_provider_execution_follow_up" +
          "_delivery_follow_up".repeat(9),
        delivery_status: "failed",
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
      });
      expect(newestFinalClosureNextReconciliation.unresolved_operations).toHaveLength(
        1
      );

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          `validate-review-${newestFinalClosureNextCommandBase}-reconciliation`,
          ...newestFinalClosureNextTrioSourceArgs,
          newestFinalClosureNextPlanPath,
          newestFinalClosureNextReceiptPath,
          newestFinalClosureNextReconciliationPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      const newestFinalClosureNextNextCommandBase =
        "provider-execution-follow-up" + "-delivery-follow-up".repeat(13);
      const newestFinalClosureNextNextRoutingSourceArgs = [
        ...newestFinalClosureNextTrioSourceArgs,
        newestFinalClosureNextPlanPath,
        newestFinalClosureNextReceiptPath,
        newestFinalClosureNextReconciliationPath,
      ];
      const newestFinalClosureNextNextRoutingRepairState =
        "repair_follow_up" + "_delivery_follow_up".repeat(12) + "_required";

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          `render-review-${newestFinalClosureNextNextCommandBase}`,
          ...newestFinalClosureNextNextRoutingSourceArgs,
          "--out",
          newestFinalClosureNextNextRoutingPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      const newestFinalClosureNextNextRouting = JSON.parse(
        await readFile(newestFinalClosureNextNextRoutingPath, "utf8")
      );
      expect(newestFinalClosureNextNextRouting).toMatchObject({
        schema_version: `content-pipeline-review-${newestFinalClosureNextNextCommandBase}/v0.1`,
        source_follow_up_plan_schema_version:
          newestFinalClosureNextPlan.schema_version,
        source_follow_up_reconciliation_schema_version:
          newestFinalClosureNextReconciliation.schema_version,
        source_reconciliation_status:
          newestFinalClosureNextReconciliation.reconciliation_status,
        source_recommended_follow_up:
          newestFinalClosureNextReconciliation.recommended_follow_up,
        source_delivery_status: newestFinalClosureNextReconciliation.delivery_status,
        follow_up_state: newestFinalClosureNextNextRoutingRepairState,
        follow_up_action:
          "open_manual_repair_follow_up" +
          "_delivery_follow_up".repeat(12) +
          "_item",
        follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed:
          false,
        automation_step: "open_inbox_item",
        decision_boundary: {
          requires_provider_execution: false,
          requires_human_decision: true,
          provider_execution_allowed_without_human: false,
        },
      });
      expect(newestFinalClosureNextNextRouting.follow_up_item?.item_key).toContain(
        "provider-follow-up" + "-delivery-follow-up".repeat(13) + "-repair:"
      );
      expect(
        newestFinalClosureNextNextRouting.follow_up_item?.title.match(
          /Delivery Follow-up/g
        )
      ).toHaveLength(13);
      expect(newestFinalClosureNextNextRouting.follow_up_item?.labels).toContain(
        `follow_up_state:${newestFinalClosureNextNextRoutingRepairState}`
      );

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          `validate-review-${newestFinalClosureNextNextCommandBase}`,
          ...newestFinalClosureNextNextRoutingSourceArgs,
          newestFinalClosureNextNextRoutingPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });
      const newestFinalClosureNextNextSchemaBase =
        `content-pipeline-review-${newestFinalClosureNextNextCommandBase}`;
      const newestFinalClosureNextNextTrioSourceArgs = [
        ...newestFinalClosureNextNextRoutingSourceArgs,
        newestFinalClosureNextNextRoutingPath,
      ];

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          `render-review-${newestFinalClosureNextNextCommandBase}-plan`,
          ...newestFinalClosureNextNextTrioSourceArgs,
          "--out",
          newestFinalClosureNextNextPlanPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      const newestFinalClosureNextNextPlan = JSON.parse(
        await readFile(newestFinalClosureNextNextPlanPath, "utf8")
      );
      expect(newestFinalClosureNextNextPlan).toMatchObject({
        schema_version: `${newestFinalClosureNextNextSchemaBase}-plan/v0.1`,
        source_follow_up_schema_version:
          newestFinalClosureNextNextRouting.schema_version,
        follow_up_state: newestFinalClosureNextNextRouting.follow_up_state,
        delivery_action: "create_follow_up_inbox_item",
        final_follow_up_item_key:
          newestFinalClosureNextNextRouting.follow_up_item?.item_key,
        final_follow_up_queue:
          newestFinalClosureNextNextRouting.follow_up_item?.human_queue,
        automation_step: "open_inbox_item",
      });
      expect(newestFinalClosureNextNextPlan.upsert?.operation_key).toContain(
        `${newestFinalClosureNextNextCommandBase}:upsert:`
      );

      expect(
        validateProviderExecutionFollowUpN13Plan(
          newestFinalClosureNextNextRouting,
          newestFinalClosureNextNextPlan
        ).ok
      ).toBe(true);

      const newestFinalClosureNextNextReceipt =
        buildProviderExecutionFollowUpN13Receipt(newestFinalClosureNextNextPlan, {
          executed_at: "2026-04-24T02:20:00.000Z",
          upsert_status: "failed",
        });
      expect(newestFinalClosureNextNextReceipt).toMatchObject({
        schema_version: `${newestFinalClosureNextNextSchemaBase}-receipt/v0.1`,
        source_follow_up_plan_schema_version:
          newestFinalClosureNextNextPlan.schema_version,
        overall_status: "failed",
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
      });
      expect(newestFinalClosureNextNextReceipt.operations).toHaveLength(1);
      expect(newestFinalClosureNextNextReceipt.operations[0]).toMatchObject({
        operation_key: newestFinalClosureNextNextPlan.upsert?.operation_key,
        operation_type: "upsert",
        target_item_key: newestFinalClosureNextNextPlan.upsert?.item_key,
        status: "failed",
      });

      expect(
        validateProviderExecutionFollowUpN13Receipt(
          newestFinalClosureNextNextPlan,
          newestFinalClosureNextNextReceipt
        ).ok
      ).toBe(true);

      const newestFinalClosureNextNextReconciliation =
        buildProviderExecutionFollowUpN13Reconciliation(
          newestFinalClosureNextNextPlan,
          newestFinalClosureNextNextReceipt
        );
      expect(newestFinalClosureNextNextReconciliation).toMatchObject({
        schema_version: `${newestFinalClosureNextNextSchemaBase}-reconciliation/v0.1`,
        source_follow_up_plan_schema_version:
          newestFinalClosureNextNextPlan.schema_version,
        source_follow_up_receipt_schema_version:
          newestFinalClosureNextNextReceipt.schema_version,
        receipt_validation_ok: true,
        reconciliation_status: "action_required",
        recommended_follow_up:
          "manual_repair_provider_execution_follow_up" +
          "_delivery_follow_up".repeat(9),
        delivery_status: "failed",
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
      });
      expect(newestFinalClosureNextNextReconciliation.unresolved_operations).toHaveLength(
        1
      );
      expect(
        validateProviderExecutionFollowUpN13Reconciliation(
          newestFinalClosureNextNextPlan,
          newestFinalClosureNextNextReceipt,
          newestFinalClosureNextNextReconciliation
        ).ok
      ).toBe(true);

      const malformedNewestFinalClosureNextNextReceipt = {
        ...newestFinalClosureNextNextReceipt,
        final_follow_up_item_key:
          newestFinalClosureNextNextPlan.upsert?.item_key ??
          "content-pipeline:manual_triage_queue:forged-n13-final-item",
        final_follow_up_queue:
          newestFinalClosureNextNextPlan.upsert?.human_queue ??
          "manual_triage_queue",
        operations: newestFinalClosureNextNextReceipt.operations.map((operation) => ({
          ...operation,
          status: "skipped",
        })),
      } as unknown as typeof newestFinalClosureNextNextReceipt;
      const malformedNewestFinalClosureNextNextReconciliation =
        buildProviderExecutionFollowUpN13Reconciliation(
          newestFinalClosureNextNextPlan,
          malformedNewestFinalClosureNextNextReceipt
        );

      expect(
        validateProviderExecutionFollowUpN13Receipt(
          newestFinalClosureNextNextPlan,
          malformedNewestFinalClosureNextNextReceipt
        ).ok
      ).toBe(false);
      expect(malformedNewestFinalClosureNextNextReconciliation).toMatchObject({
        receipt_validation_ok: false,
        reconciliation_status: "action_required",
        recommended_follow_up: "manual_receipt_triage",
        delivery_status: null,
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
        unresolved_operations: [],
      });
      expect(
        malformedNewestFinalClosureNextNextReconciliation.receipt_validation_issue_codes
      ).toContain("invalid_operation_status");
      expect(
        validateProviderExecutionFollowUpN13Reconciliation(
          newestFinalClosureNextNextPlan,
          malformedNewestFinalClosureNextNextReceipt,
          malformedNewestFinalClosureNextNextReconciliation
        ).ok
      ).toBe(true);


      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          `render-review-${newestFinalClosureNextCommandBase}-receipt`,
          ...newestFinalClosureNextTrioSourceArgs,
          newestFinalClosureNextPlanPath,
          "--upsert-status",
          "applied",
          "--executed-at",
          "2026-04-24T02:10:00.000Z",
          "--out",
          newestFinalClosureNextAppliedReceiptPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      const newestFinalClosureNextAppliedReceipt = JSON.parse(
        await readFile(newestFinalClosureNextAppliedReceiptPath, "utf8")
      );
      expect(newestFinalClosureNextAppliedReceipt).toMatchObject({
        schema_version: `${newestFinalClosureNextSchemaBase}-receipt/v0.1`,
        overall_status: "applied",
        final_follow_up_item_key: newestFinalClosureNextPlan.upsert?.item_key,
        final_follow_up_queue: newestFinalClosureNextPlan.upsert?.human_queue,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          `render-review-${newestFinalClosureNextCommandBase}-reconciliation`,
          ...newestFinalClosureNextTrioSourceArgs,
          newestFinalClosureNextPlanPath,
          newestFinalClosureNextAppliedReceiptPath,
          "--out",
          newestFinalClosureNextAppliedReconciliationPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      const newestFinalClosureNextAppliedReconciliation = JSON.parse(
        await readFile(newestFinalClosureNextAppliedReconciliationPath, "utf8")
      );
      expect(newestFinalClosureNextAppliedReconciliation).toMatchObject({
        schema_version: `${newestFinalClosureNextSchemaBase}-reconciliation/v0.1`,
        receipt_validation_ok: true,
        reconciliation_status: "closed",
        recommended_follow_up: "none",
        delivery_status: "applied",
        final_follow_up_item_key: newestFinalClosureNextPlan.upsert?.item_key,
        final_follow_up_queue: newestFinalClosureNextPlan.upsert?.human_queue,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          `render-review-${newestFinalClosureNextNextCommandBase}`,
          ...newestFinalClosureNextTrioSourceArgs,
          newestFinalClosureNextPlanPath,
          newestFinalClosureNextAppliedReceiptPath,
          newestFinalClosureNextAppliedReconciliationPath,
          "--out",
          newestFinalClosureNextNextDeliveredRoutingPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      const newestFinalClosureNextNextDeliveredRouting = JSON.parse(
        await readFile(newestFinalClosureNextNextDeliveredRoutingPath, "utf8")
      );
      expect(newestFinalClosureNextNextDeliveredRouting).toMatchObject({
        schema_version: `content-pipeline-review-${newestFinalClosureNextNextCommandBase}/v0.1`,
        source_reconciliation_status: "closed",
        source_recommended_follow_up: "none",
        source_delivery_status: "applied",
        follow_up_state: "manual_follow_up_item_delivered",
        follow_up_action: "none",
        follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed:
          true,
        active_follow_up_item: {
          item_key: newestFinalClosureNextPlan.upsert?.item_key,
          human_queue: newestFinalClosureNextPlan.upsert?.human_queue,
          should_remain_open: true,
        },
        automation_step: "none",
        decision_boundary: {
          requires_provider_execution: false,
          requires_human_decision: false,
          provider_execution_allowed_without_human: false,
        },
        follow_up_item: null,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          `validate-review-${newestFinalClosureNextNextCommandBase}`,
          ...newestFinalClosureNextTrioSourceArgs,
          newestFinalClosureNextPlanPath,
          newestFinalClosureNextAppliedReceiptPath,
          newestFinalClosureNextAppliedReconciliationPath,
          newestFinalClosureNextNextDeliveredRoutingPath,
        ],
        io
      );
      expect(exitCode).toBe(0);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        issue_count: 0,
      });

      const newestFinalClosureNextNextDeliveredTrioSourceArgs = [
        ...newestFinalClosureNextTrioSourceArgs,
        newestFinalClosureNextPlanPath,
        newestFinalClosureNextAppliedReceiptPath,
        newestFinalClosureNextAppliedReconciliationPath,
        newestFinalClosureNextNextDeliveredRoutingPath,
      ];

      const newestFinalClosureNextNextDeliveredPlan =
        buildProviderExecutionFollowUpN13Plan(
          newestFinalClosureNextNextDeliveredRouting
        );
      expect(newestFinalClosureNextNextDeliveredPlan).toMatchObject({
        schema_version: `${newestFinalClosureNextNextSchemaBase}-plan/v0.1`,
        follow_up_state: "manual_follow_up_item_delivered",
        delivery_action: "none",
        final_follow_up_item_key: newestFinalClosureNextPlan.upsert?.item_key,
        final_follow_up_queue: newestFinalClosureNextPlan.upsert?.human_queue,
        upsert: null,
        automation_step: "none",
      });
      expect(
        validateProviderExecutionFollowUpN13Plan(
          newestFinalClosureNextNextDeliveredRouting,
          newestFinalClosureNextNextDeliveredPlan
        ).ok
      ).toBe(true);
      expect(
        validateProviderExecutionFollowUpN13PlanContract(
          newestFinalClosureNextNextDeliveredPlan
        ).ok
      ).toBe(true);

      const newestFinalClosureNextNextDeliveredReceipt =
        buildProviderExecutionFollowUpN13Receipt(
          newestFinalClosureNextNextDeliveredPlan,
          { executed_at: "2026-04-24T02:30:00.000Z" }
        );
      expect(newestFinalClosureNextNextDeliveredReceipt).toMatchObject({
        schema_version: `${newestFinalClosureNextNextSchemaBase}-receipt/v0.1`,
        overall_status: "applied",
        final_follow_up_item_key: newestFinalClosureNextPlan.upsert?.item_key,
        final_follow_up_queue: newestFinalClosureNextPlan.upsert?.human_queue,
        operations: [],
      });
      expect(
        validateProviderExecutionFollowUpN13Receipt(
          newestFinalClosureNextNextDeliveredPlan,
          newestFinalClosureNextNextDeliveredReceipt
        ).ok
      ).toBe(true);

      const newestFinalClosureNextNextDeliveredReconciliation =
        buildProviderExecutionFollowUpN13Reconciliation(
          newestFinalClosureNextNextDeliveredPlan,
          newestFinalClosureNextNextDeliveredReceipt
        );
      expect(newestFinalClosureNextNextDeliveredReconciliation).toMatchObject({
        schema_version: `${newestFinalClosureNextNextSchemaBase}-reconciliation/v0.1`,
        receipt_validation_ok: true,
        reconciliation_status: "closed",
        recommended_follow_up: "none",
        delivery_status: "applied",
        final_follow_up_item_key: newestFinalClosureNextPlan.upsert?.item_key,
        final_follow_up_queue: newestFinalClosureNextPlan.upsert?.human_queue,
        unresolved_operations: [],
      });
      expect(
        validateProviderExecutionFollowUpN13Reconciliation(
          newestFinalClosureNextNextDeliveredPlan,
          newestFinalClosureNextNextDeliveredReceipt,
          newestFinalClosureNextNextDeliveredReconciliation
        ).ok
      ).toBe(true);

      const n13DeliveredPlanPath = join(tempDir, "n13-delivered-plan.json");
      const n13DeliveredReceiptPath = join(tempDir, "n13-delivered-receipt.json");
      const n13DeliveredReconciliationPath = join(
        tempDir,
        "n13-delivered-reconciliation.json"
      );
      await writeFile(
        n13DeliveredPlanPath,
        `${JSON.stringify(newestFinalClosureNextNextDeliveredPlan, null, 2)}\n`,
        "utf8"
      );
      await writeFile(
        n13DeliveredReceiptPath,
        `${JSON.stringify(newestFinalClosureNextNextDeliveredReceipt, null, 2)}\n`,
        "utf8"
      );
      await writeFile(
        n13DeliveredReconciliationPath,
        `${JSON.stringify(newestFinalClosureNextNextDeliveredReconciliation, null, 2)}\n`,
        "utf8"
      );

      let generatedCommandBase = "";
      let generatedTrioSourceArgs: string[] = [];
      let generatedPlanPath = "";
      let generatedReceiptPath = "";
      let generatedReconciliationPath = "";
      let generatedRoutingSourceArgs = [
        ...newestFinalClosureNextNextDeliveredTrioSourceArgs,
        n13DeliveredPlanPath,
        n13DeliveredReceiptPath,
        n13DeliveredReconciliationPath,
      ];

      for (let depth = 14; depth <= 17; depth += 1) {
        generatedCommandBase =
          "provider-execution-follow-up" + "-delivery-follow-up".repeat(depth);
        const routingPath = join(tempDir, `n${depth}.json`);
        const planPath = join(tempDir, `n${depth}-plan.json`);
        const receiptPath = join(tempDir, `n${depth}-receipt.json`);
        const reconciliationPath = join(tempDir, `n${depth}-reconciliation.json`);

        stdout.length = 0;
        stderr.length = 0;
        exitCode = await runContentPipelineCli(
          [`render-review-${generatedCommandBase}`, ...generatedRoutingSourceArgs, "--out", routingPath],
          io
        );
        expect(exitCode).toBe(0);
        expect(stderr).toEqual([]);

        stdout.length = 0;
        exitCode = await runContentPipelineCli(
          [`validate-review-${generatedCommandBase}`, ...generatedRoutingSourceArgs, routingPath],
          io
        );
        expect(exitCode).toBe(0);
        expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
          ok: true,
          issue_count: 0,
        });

        generatedTrioSourceArgs = [...generatedRoutingSourceArgs, routingPath];

        stdout.length = 0;
        exitCode = await runContentPipelineCli(
          [
            `render-review-${generatedCommandBase}-plan`,
            ...generatedTrioSourceArgs,
            "--out",
            planPath,
          ],
          io
        );
        expect(exitCode).toBe(0);

        stdout.length = 0;
        exitCode = await runContentPipelineCli(
          [
            `validate-review-${generatedCommandBase}-plan`,
            ...generatedTrioSourceArgs,
            planPath,
          ],
          io
        );
        expect(exitCode).toBe(0);
        expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
          ok: true,
          issue_count: 0,
        });

        stdout.length = 0;
        exitCode = await runContentPipelineCli(
          [
            `render-review-${generatedCommandBase}-receipt`,
            ...generatedTrioSourceArgs,
            planPath,
            "--executed-at",
            `2026-04-24T03:${String(depth).padStart(2, "0")}:00.000Z`,
            "--out",
            receiptPath,
          ],
          io
        );
        expect(exitCode).toBe(0);

        stdout.length = 0;
        exitCode = await runContentPipelineCli(
          [
            `validate-review-${generatedCommandBase}-receipt`,
            ...generatedTrioSourceArgs,
            planPath,
            receiptPath,
          ],
          io
        );
        expect(exitCode).toBe(0);
        expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
          ok: true,
          issue_count: 0,
        });

        stdout.length = 0;
        exitCode = await runContentPipelineCli(
          [
            `render-review-${generatedCommandBase}-reconciliation`,
            ...generatedTrioSourceArgs,
            planPath,
            receiptPath,
            "--out",
            reconciliationPath,
          ],
          io
        );
        expect(exitCode).toBe(0);

        stdout.length = 0;
        exitCode = await runContentPipelineCli(
          [
            `validate-review-${generatedCommandBase}-reconciliation`,
            ...generatedTrioSourceArgs,
            planPath,
            receiptPath,
            reconciliationPath,
          ],
          io
        );
        expect(exitCode).toBe(0);
        expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
          ok: true,
          issue_count: 0,
        });

        generatedPlanPath = planPath;
        generatedReceiptPath = receiptPath;
        generatedReconciliationPath = reconciliationPath;
        generatedRoutingSourceArgs = [
          ...generatedTrioSourceArgs,
          generatedPlanPath,
          generatedReceiptPath,
          generatedReconciliationPath,
        ];
      }

      expect(generatedCommandBase).toBe(
        "provider-execution-follow-up" + "-delivery-follow-up".repeat(17)
      );

      const malformedTargetCases = [
        {
          suffix: "plan",
          path: join(tempDir, "malformed-n17-plan-target.json"),
          args: [
            `validate-review-${generatedCommandBase}-plan`,
            ...generatedTrioSourceArgs,
            join(tempDir, "malformed-n17-plan-target.json"),
          ],
          expectedIssueCode: "invalid_plan_schema_version",
        },
        {
          suffix: "receipt",
          path: join(tempDir, "malformed-n17-receipt-target.json"),
          args: [
            `validate-review-${generatedCommandBase}-receipt`,
            ...generatedTrioSourceArgs,
            generatedPlanPath,
            join(tempDir, "malformed-n17-receipt-target.json"),
          ],
          expectedIssueCode: "invalid_receipt_schema_version",
        },
        {
          suffix: "reconciliation",
          path: join(tempDir, "malformed-n17-reconciliation-target.json"),
          args: [
            `validate-review-${generatedCommandBase}-reconciliation`,
            ...generatedTrioSourceArgs,
            generatedPlanPath,
            generatedReceiptPath,
            join(tempDir, "malformed-n17-reconciliation-target.json"),
          ],
          expectedIssueCode: "invalid_reconciliation_schema_version",
        },
      ] as const;

      expect(generatedReconciliationPath).not.toBe("");
      for (const targetCase of malformedTargetCases) {
        await writeFile(targetCase.path, "null\n", "utf8");

        stdout.length = 0;
        stderr.length = 0;
        exitCode = await runContentPipelineCli(targetCase.args, io);
        const malformedTargetSummary = JSON.parse(stdout[0] ?? "{}") as {
          ok: boolean;
          issues: Array<{ code: string; stage: string }>;
        };

        expect(exitCode).toBe(1);
        expect(stderr).toEqual([]);
        expect(malformedTargetSummary.ok).toBe(false);
        expect(malformedTargetSummary.issues.map((issue) => issue.code)).toContain(
          targetCase.expectedIssueCode
        );
        expect(
          malformedTargetSummary.issues.some((issue) =>
            issue.stage.endsWith(`_${targetCase.suffix}`)
          )
        ).toBe(true);
        expect(JSON.stringify(malformedTargetSummary)).not.toContain(
          "Cannot read properties"
        );
        expect(JSON.stringify(malformedTargetSummary)).not.toContain("TypeError");
      }

      const emptyActiveFollowUpItem = {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      };
      const nullPreservedPlan = {
        ...newestFinalClosureNextPlan,
        preserved_active_follow_up_item: emptyActiveFollowUpItem,
      };
      const nullPreservedAppliedReconciliation = {
        ...newestFinalClosureNextAppliedReconciliation,
        preserved_active_follow_up_item: emptyActiveFollowUpItem,
      };
      const nullPreservedDeliveredRouting = buildProviderExecutionFollowUpN13(
        nullPreservedPlan,
        nullPreservedAppliedReconciliation
      );
      expect(nullPreservedDeliveredRouting).toMatchObject({
        source_reconciliation_status: "closed",
        source_recommended_follow_up: "none",
        source_delivery_status: "applied",
        follow_up_state: "manual_follow_up_item_delivered",
        follow_up_action: "none",
        preserved_active_follow_up_item: emptyActiveFollowUpItem,
        active_follow_up_item: {
          item_key: newestFinalClosureNextPlan.upsert?.item_key,
          human_queue: newestFinalClosureNextPlan.upsert?.human_queue,
          should_remain_open: true,
        },
        automation_step: "none",
        follow_up_item: null,
      });
      expect(
        validateProviderExecutionFollowUpN13(
          nullPreservedPlan,
          nullPreservedAppliedReconciliation,
          nullPreservedDeliveredRouting
        )
      ).toMatchObject({
        ok: true,
        issues: [],
      });

      expect(stderr).toEqual([]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 900000);

  it("keeps latest downstream routing branches explicit and depth-disambiguated", () => {
    const resultArtifactHandoff = {
      expected_schema_version: "content-pipeline-review-artifact/v0.1",
      generated_at: "2026-04-24T00:30:00.000Z",
      status: "ready_for_human_review",
    } as const;
    const latestDepthLabel =
      "provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up";
    const latestRepairSuffix =
      "provider-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-repair";
    const latestReceiptSuffix =
      "provider-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt";

    const artifactPlan = makeLatestDownstreamPlan({
      follow_up_state: "result_artifact_handoff_ready",
      follow_up_action: "defer_to_result_artifact_contract",
      preserved_result_artifact_handoff: resultArtifactHandoff,
      preserved_active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    const artifactReconciliation = makeLatestDownstreamReconciliation(artifactPlan, {
      result_artifact_handoff: resultArtifactHandoff,
      preserved_active_follow_up_item: artifactPlan.preserved_active_follow_up_item,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    const artifactFollowUp =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        artifactPlan,
        artifactReconciliation
      );

    expect(artifactFollowUp).toMatchObject({
      follow_up_state: "result_artifact_handoff_ready",
      follow_up_action: "defer_to_result_artifact_contract",
      result_artifact_handoff: resultArtifactHandoff,
      automation_step: "none",
      follow_up_item: null,
    });
    expect(
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        artifactPlan,
        artifactReconciliation,
        artifactFollowUp
      ).ok
    ).toBe(true);

    const repairPlan = makeLatestDownstreamPlan({
      follow_up_state:
        "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required",
      follow_up_action:
        "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_item",
      follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed:
        false,
      preserved_active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    const repairReconciliation = makeLatestDownstreamReconciliation(repairPlan, {
      reconciliation_status: "action_required",
      recommended_follow_up:
        "manual_repair_provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up",
      delivery_status: "failed",
      preserved_active_follow_up_item: repairPlan.preserved_active_follow_up_item,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      unresolved_operations: [
        {
          operation_key: "repair-op-001",
          operation_type: "upsert",
          target_item_key: "content-pipeline:manual_triage_queue:repair-target",
          status: "failed",
        },
      ],
    });
    const repairFollowUp =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        repairPlan,
        repairReconciliation
      );

    expect(repairFollowUp.follow_up_item?.item_key).toContain(latestRepairSuffix);
    expect(repairFollowUp.follow_up_item?.labels).toContain(latestDepthLabel);
    expect(repairFollowUp).toMatchObject({
      follow_up_state:
        "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required",
      follow_up_action:
        "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_item",
      automation_step: "open_inbox_item",
      decision_boundary: {
        requires_human_decision: true,
      },
    });
    expect(
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        repairPlan,
        repairReconciliation,
        repairFollowUp
      ).ok
    ).toBe(true);

    const receiptPlan = makeLatestDownstreamPlan({
      follow_up_state: "receipt_triage_required",
      follow_up_action: "open_manual_receipt_triage_item",
      follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed:
        false,
      preserved_active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    const receiptReconciliation = makeLatestDownstreamReconciliation(receiptPlan, {
      receipt_validation_ok: false,
      receipt_validation_issue_codes: ["invalid_operation_status"],
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_receipt_triage",
      delivery_status: null,
      preserved_active_follow_up_item: receiptPlan.preserved_active_follow_up_item,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    const receiptFollowUp =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        receiptPlan,
        receiptReconciliation
      );

    expect(receiptFollowUp.follow_up_item?.item_key).toContain(latestReceiptSuffix);
    expect(receiptFollowUp.follow_up_item?.labels).toContain(latestDepthLabel);
    expect(receiptFollowUp.follow_up_item?.labels).toContain(
      "receipt_validation:invalid_operation_status"
    );
    expect(receiptFollowUp).toMatchObject({
      follow_up_state: "receipt_triage_required",
      follow_up_action: "open_manual_receipt_triage_item",
      automation_step: "open_inbox_item",
      active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
    });
    expect(
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        receiptPlan,
        receiptReconciliation,
        receiptFollowUp
      ).ok
    ).toBe(true);
  });

  it("keeps latest executor-ready trio branches closed, deterministic, and receipt-fail-closed", () => {
    const resultArtifactHandoff = {
      expected_schema_version: "content-pipeline-review-artifact/v0.1",
      generated_at: "2026-04-24T00:30:00.000Z",
      status: "ready_for_human_review",
    } as const;
    const executedAt = "2026-04-24T00:50:00.000Z";

    const artifactSourcePlan = makeLatestDownstreamPlan({
      follow_up_state: "result_artifact_handoff_ready",
      follow_up_action: "defer_to_result_artifact_contract",
      preserved_result_artifact_handoff: resultArtifactHandoff,
      preserved_active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    const artifactSourceReconciliation = makeLatestDownstreamReconciliation(
      artifactSourcePlan,
      {
        result_artifact_handoff: resultArtifactHandoff,
        preserved_active_follow_up_item:
          artifactSourcePlan.preserved_active_follow_up_item,
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
      }
    );
    const artifactFollowUp =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        artifactSourcePlan,
        artifactSourceReconciliation
      );
    const artifactPlan =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
        artifactFollowUp
      );
    const artifactReceipt =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
        artifactPlan,
        { executed_at: executedAt }
      );
    const artifactReconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
        artifactPlan,
        artifactReceipt
      );

    expect(artifactPlan).toMatchObject({
      delivery_action: "none",
      upsert: null,
      preserved_result_artifact_handoff: resultArtifactHandoff,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    expect(artifactReceipt).toMatchObject({
      overall_status: "applied",
      operations: [],
    });
    expect(artifactReconciliation).toMatchObject({
      receipt_validation_ok: true,
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      result_artifact_handoff: resultArtifactHandoff,
    });
    expect(
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
        artifactFollowUp,
        artifactPlan
      ).ok
    ).toBe(true);
    expect(
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
        artifactPlan,
        artifactReceipt
      ).ok
    ).toBe(true);
    expect(
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
        artifactPlan,
        artifactReceipt,
        artifactReconciliation
      ).ok
    ).toBe(true);

    const repairSourcePlan = makeLatestDownstreamPlan({
      follow_up_state:
        "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required",
      follow_up_action:
        "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_item",
      follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed:
        false,
      preserved_active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    const repairSourceReconciliation = makeLatestDownstreamReconciliation(
      repairSourcePlan,
      {
        reconciliation_status: "action_required",
        recommended_follow_up:
          "manual_repair_provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up",
        delivery_status: "failed",
        preserved_active_follow_up_item:
          repairSourcePlan.preserved_active_follow_up_item,
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
        unresolved_operations: [
          {
            operation_key: "repair-op-001",
            operation_type: "upsert",
            target_item_key: "content-pipeline:manual_triage_queue:repair-target",
            status: "failed",
          },
        ],
      }
    );
    const repairFollowUp =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        repairSourcePlan,
        repairSourceReconciliation
      );
    const repairPlan =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
        repairFollowUp
      );
    const failedRepairReceipt =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
        repairPlan,
        { executed_at: executedAt, upsert_status: "failed" }
      );
    const repairReconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
        repairPlan,
        failedRepairReceipt
      );

    expect(repairPlan.delivery_action).toBe("create_follow_up_inbox_item");
    expect(repairPlan.upsert?.operation_key).toBe(
      `content-pipeline:provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up:upsert:${repairPlan.upsert?.item_key}`
    );
    expect(failedRepairReceipt).toMatchObject({
      overall_status: "failed",
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    expect(repairReconciliation).toMatchObject({
      receipt_validation_ok: true,
      reconciliation_status: "action_required",
      recommended_follow_up:
        "manual_repair_provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up",
      delivery_status: "failed",
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    expect(repairReconciliation.unresolved_operations).toHaveLength(1);
    expect(
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
        repairPlan,
        failedRepairReceipt,
        repairReconciliation
      ).ok
    ).toBe(true);

    const malformedRepairReceipt = {
      ...failedRepairReceipt,
      operations: failedRepairReceipt.operations.map((operation) => ({
        ...operation,
        status: "skipped",
      })),
    } as unknown as typeof failedRepairReceipt;
    const malformedReceiptValidation =
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
        repairPlan,
        malformedRepairReceipt
      );
    const malformedReconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
        repairPlan,
        malformedRepairReceipt
      );

    expect(malformedReceiptValidation.ok).toBe(false);
    expect(malformedReceiptValidation.issues.map((issue) => issue.code)).toContain(
      "invalid_operation_status"
    );
    expect(malformedReconciliation).toMatchObject({
      receipt_validation_ok: false,
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_receipt_triage",
      delivery_status: null,
      result_artifact_handoff: null,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      unresolved_operations: [],
    });
    expect(malformedReconciliation.receipt_validation_issue_codes).toContain(
      "invalid_operation_status"
    );
    expect(
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
        repairPlan,
        malformedRepairReceipt,
        malformedReconciliation
      ).ok
    ).toBe(true);
  });

  it("reduces latest executor-ready trio into the next explicit routing contract", () => {
    const resultArtifactHandoff = {
      expected_schema_version: "content-pipeline-review-artifact/v0.1",
      generated_at: "2026-04-24T01:05:00.000Z",
      status: "ready_for_human_review",
    } as const;
    const executedAt = "2026-04-24T01:10:00.000Z";
    const nextDepthLabel =
      "provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up";
    const nextRepairSuffix =
      "provider-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-repair";
    const nextReceiptSuffix =
      "provider-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt";

    const artifactSourcePlan = makeLatestDownstreamPlan({
      follow_up_state: "result_artifact_handoff_ready",
      follow_up_action: "defer_to_result_artifact_contract",
      preserved_result_artifact_handoff: resultArtifactHandoff,
      preserved_active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    const artifactSourceReconciliation = makeLatestDownstreamReconciliation(
      artifactSourcePlan,
      {
        result_artifact_handoff: resultArtifactHandoff,
        preserved_active_follow_up_item:
          artifactSourcePlan.preserved_active_follow_up_item,
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
      }
    );
    const artifactFollowUp =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        artifactSourcePlan,
        artifactSourceReconciliation
      );
    const artifactPlan =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
        artifactFollowUp
      );
    const artifactReceipt =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
        artifactPlan,
        { executed_at: executedAt }
      );
    const artifactReconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
        artifactPlan,
        artifactReceipt
      );
    const artifactNextRouting =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        artifactPlan,
        artifactReconciliation
      );

    expect(artifactNextRouting).toMatchObject({
      follow_up_state: "result_artifact_handoff_ready",
      follow_up_action: "defer_to_result_artifact_contract",
      result_artifact_handoff: resultArtifactHandoff,
      automation_step: "none",
      follow_up_item: null,
    });
    expect(
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        artifactPlan,
        artifactReconciliation,
        artifactNextRouting
      ).ok
    ).toBe(true);

    const repairSourcePlan = makeLatestDownstreamPlan({
      follow_up_state:
        "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required",
      follow_up_action:
        "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_item",
      follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed:
        false,
      preserved_active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    const repairSourceReconciliation = makeLatestDownstreamReconciliation(
      repairSourcePlan,
      {
        reconciliation_status: "action_required",
        recommended_follow_up:
          "manual_repair_provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up",
        delivery_status: "failed",
        preserved_active_follow_up_item:
          repairSourcePlan.preserved_active_follow_up_item,
        final_follow_up_item_key: null,
        final_follow_up_queue: null,
        unresolved_operations: [
          {
            operation_key: "repair-op-002",
            operation_type: "upsert",
            target_item_key: "content-pipeline:manual_triage_queue:repair-target-002",
            status: "failed",
          },
        ],
      }
    );
    const repairFollowUp =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        repairSourcePlan,
        repairSourceReconciliation
      );
    const repairPlan =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
        repairFollowUp
      );
    const failedRepairReceipt =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
        repairPlan,
        { executed_at: executedAt, upsert_status: "failed" }
      );
    const repairReconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
        repairPlan,
        failedRepairReceipt
      );
    const repairNextRouting =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        repairPlan,
        repairReconciliation
      );

    expect(repairNextRouting.follow_up_item?.item_key).toContain(nextRepairSuffix);
    expect(repairNextRouting.follow_up_item?.labels).toContain(nextDepthLabel);
    expect(repairNextRouting).toMatchObject({
      follow_up_state:
        "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required",
      follow_up_action:
        "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_item",
      automation_step: "open_inbox_item",
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: true,
      },
    });
    expect(
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        repairPlan,
        repairReconciliation,
        repairNextRouting
      ).ok
    ).toBe(true);

    const malformedRepairReceipt = {
      ...failedRepairReceipt,
      operations: failedRepairReceipt.operations.map((operation) => ({
        ...operation,
        status: "skipped",
      })),
    } as unknown as typeof failedRepairReceipt;
    const malformedReconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
        repairPlan,
        malformedRepairReceipt
      );
    const receiptNextRouting =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        repairPlan,
        malformedReconciliation
      );

    expect(receiptNextRouting.follow_up_item?.item_key).toContain(nextReceiptSuffix);
    expect(receiptNextRouting.follow_up_item?.labels).toContain(nextDepthLabel);
    expect(
      receiptNextRouting.follow_up_item?.labels.some(
        (label: string) =>
          label.startsWith("receipt_validation:") &&
          label.includes("invalid_operation_status")
      )
    ).toBe(true);
    expect(receiptNextRouting).toMatchObject({
      follow_up_state: "receipt_triage_required",
      follow_up_action: "open_manual_receipt_triage_item",
      result_artifact_handoff: null,
      active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
    });
    expect(
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        repairPlan,
        malformedReconciliation,
        receiptNextRouting
      ).ok
    ).toBe(true);
  });



  it("reduces N13 executor-ready trio into the N14 explicit routing contract", () => {
    type N14SourcePlan = Parameters<typeof validateProviderExecutionFollowUpN14SourceContract>[0];
    type N14SourceReconciliation = Parameters<typeof validateProviderExecutionFollowUpN14SourceContract>[1];

    const resultArtifactHandoff = {
      expected_schema_version: "content-pipeline-review-artifact/v0.1",
      generated_at: "2026-04-24T03:05:00.000Z",
      status: "ready_for_human_review",
    } as const;
    const requestKey =
      "content-pipeline:provider-execution-request:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z";
    const chainKey =
      "content-pipeline:provider-execution-chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z";
    const attemptKey =
      "content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T03:10:00.000Z";
    const unitId = "math_g8_linear_function_intro";
    const n13Schema =
      "content-pipeline-review-provider-execution-follow-up" +
      "-delivery-follow-up".repeat(13) +
      "/v0.1";
    const n13PlanSchema =
      "content-pipeline-review-provider-execution-follow-up" +
      "-delivery-follow-up".repeat(13) +
      "-plan/v0.1";
    const n13ReceiptSchema =
      "content-pipeline-review-provider-execution-follow-up" +
      "-delivery-follow-up".repeat(13) +
      "-receipt/v0.1";
    const n13ReconciliationSchema =
      "content-pipeline-review-provider-execution-follow-up" +
      "-delivery-follow-up".repeat(13) +
      "-reconciliation/v0.1";
    const n13RepairState =
      "repair_follow_up" + "_delivery_follow_up".repeat(12) + "_required";
    const n13RepairAction =
      "open_manual_repair_follow_up" +
      "_delivery_follow_up".repeat(12) +
      "_item";
    const n13RepairRecommendation =
      "manual_repair_provider_execution_follow_up" +
      "_delivery_follow_up".repeat(9);
    const n14RepairState =
      "repair_follow_up" + "_delivery_follow_up".repeat(13) + "_required";
    const n14RepairAction =
      "open_manual_repair_follow_up" +
      "_delivery_follow_up".repeat(13) +
      "_item";
    const n14DepthLabel =
      "provider_execution_follow_up" + "_delivery_follow_up".repeat(14);
    const n14RepairSuffix =
      "provider-follow-up" + "-delivery-follow-up".repeat(14) + "-repair";
    const n14ReceiptSuffix =
      "provider-follow-up" + "-delivery-follow-up".repeat(14) + "-receipt";
    const deliveredItemKey =
      "content-pipeline:manual_triage_queue:" +
      unitId +
      ":provider-follow-up" +
      "-delivery-follow-up".repeat(13) +
      "-repair:" +
      attemptKey;
    const emptyActiveItem = {
      item_key: null,
      human_queue: null,
      should_remain_open: false,
    } as const;

    const makePlan = (overrides: Partial<N14SourcePlan> = {}) => ({
      schema_version: n13PlanSchema,
      source_follow_up_schema_version: n13Schema,
      request_key: requestKey,
      chain_key: chainKey,
      attempt_key: attemptKey,
      unit_id: unitId,
      follow_up_state: "result_artifact_handoff_ready",
      follow_up_action: "defer_to_result_artifact_contract",
      follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed:
        true,
      preserved_result_artifact_handoff: resultArtifactHandoff,
      preserved_active_follow_up_item: emptyActiveItem,
      delivery_action: "none",
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      upsert: null,
      automation_step: "none",
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: false,
        provider_execution_allowed_without_human: false,
      },
      ...overrides,
    } as N14SourcePlan);

    const makeReconciliation = (
      plan: N14SourcePlan,
      overrides: Partial<N14SourceReconciliation> = {}
    ) => ({
      schema_version: n13ReconciliationSchema,
      source_follow_up_plan_schema_version: plan.schema_version,
      source_follow_up_receipt_schema_version: n13ReceiptSchema,
      request_key: plan.request_key,
      chain_key: plan.chain_key,
      attempt_key: plan.attempt_key,
      unit_id: plan.unit_id,
      follow_up_state: plan.follow_up_state,
      follow_up_action: plan.follow_up_action,
      receipt_validation_ok: true,
      receipt_validation_issue_codes: [],
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      delivery_status: "applied",
      result_artifact_handoff: plan.preserved_result_artifact_handoff,
      preserved_active_follow_up_item: plan.preserved_active_follow_up_item,
      final_follow_up_item_key: plan.final_follow_up_item_key,
      final_follow_up_queue: plan.final_follow_up_queue,
      unresolved_operations: [],
      ...overrides,
    } as N14SourceReconciliation);

    const artifactPlan = makePlan();
    const artifactReconciliation = makeReconciliation(artifactPlan);
    const artifactN14 = buildProviderExecutionFollowUpN14(
      artifactPlan,
      artifactReconciliation
    );

    expect(
      validateProviderExecutionFollowUpN14SourceContract(
        artifactPlan,
        artifactReconciliation
      ).ok
    ).toBe(true);
    expect(artifactN14).toMatchObject({
      follow_up_state: "result_artifact_handoff_ready",
      follow_up_action: "defer_to_result_artifact_contract",
      result_artifact_handoff: resultArtifactHandoff,
      automation_step: "none",
      follow_up_item: null,
    });
    expect(
      validateProviderExecutionFollowUpN14(
        artifactPlan,
        artifactReconciliation,
        artifactN14
      ).ok
    ).toBe(true);

    const deliveredPlan = makePlan({
      follow_up_state: "manual_follow_up_item_delivered",
      follow_up_action: "none",
      preserved_result_artifact_handoff: null,
      final_follow_up_item_key: deliveredItemKey,
      final_follow_up_queue: "manual_triage_queue",
    } as Partial<N14SourcePlan>);
    const deliveredReconciliation = makeReconciliation(deliveredPlan, {
      result_artifact_handoff: null,
      final_follow_up_item_key: deliveredItemKey,
      final_follow_up_queue: "manual_triage_queue",
    } as Partial<N14SourceReconciliation>);
    const deliveredN14 = buildProviderExecutionFollowUpN14(
      deliveredPlan,
      deliveredReconciliation
    );

    expect(deliveredN14).toMatchObject({
      follow_up_state: "manual_follow_up_item_delivered",
      follow_up_action: "none",
      active_follow_up_item: {
        item_key: deliveredItemKey,
        human_queue: "manual_triage_queue",
        should_remain_open: true,
      },
      follow_up_item: null,
    });
    expect(
      validateProviderExecutionFollowUpN14(
        deliveredPlan,
        deliveredReconciliation,
        deliveredN14
      ).ok
    ).toBe(true);

    const repairPlan = makePlan({
      follow_up_state: n13RepairState,
      follow_up_action: n13RepairAction,
      follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed:
        false,
      preserved_result_artifact_handoff: null,
      delivery_action: "create_follow_up_inbox_item",
      automation_step: "open_inbox_item",
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: true,
        provider_execution_allowed_without_human: false,
      },
    } as Partial<N14SourcePlan>);
    const repairReconciliation = makeReconciliation(repairPlan, {
      reconciliation_status: "action_required",
      recommended_follow_up: n13RepairRecommendation,
      delivery_status: "failed",
      result_artifact_handoff: null,
      unresolved_operations: [
        {
          operation_key: "n13-repair-upsert-001",
          operation_type: "upsert",
          target_item_key:
            "content-pipeline:manual_triage_queue:" +
            unitId +
            ":n13-repair-target:" +
            attemptKey,
          status: "failed",
        },
      ],
    } as Partial<N14SourceReconciliation>);
    const repairN14 = buildProviderExecutionFollowUpN14(
      repairPlan,
      repairReconciliation
    );

    expect(repairN14.follow_up_item?.item_key).toContain(n14RepairSuffix);
    expect(repairN14.follow_up_item?.labels).toContain(n14DepthLabel);
    expect(repairN14).toMatchObject({
      follow_up_state: n14RepairState,
      follow_up_action: n14RepairAction,
      automation_step: "open_inbox_item",
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: true,
      },
    });
    expect(
      validateProviderExecutionFollowUpN14(repairPlan, repairReconciliation, repairN14)
        .ok
    ).toBe(true);

    const receiptTriageReconciliation = makeReconciliation(repairPlan, {
      receipt_validation_ok: false,
      receipt_validation_issue_codes: ["invalid_operation_status"],
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_receipt_triage",
      delivery_status: null,
      result_artifact_handoff: null,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      unresolved_operations: [],
    } as Partial<N14SourceReconciliation>);
    const receiptTriageN14 = buildProviderExecutionFollowUpN14(
      repairPlan,
      receiptTriageReconciliation
    );

    expect(receiptTriageN14.follow_up_item?.item_key).toContain(n14ReceiptSuffix);
    expect(receiptTriageN14.follow_up_item?.labels).toContain(n14DepthLabel);
    expect(receiptTriageN14.follow_up_item?.labels).toContain(
      "receipt_validation:invalid_operation_status"
    );
    expect(receiptTriageN14).toMatchObject({
      follow_up_state: "receipt_triage_required",
      follow_up_action: "open_manual_receipt_triage_item",
      result_artifact_handoff: null,
      active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
    });
    expect(
      validateProviderExecutionFollowUpN14(
        repairPlan,
        receiptTriageReconciliation,
        receiptTriageN14
      ).ok
    ).toBe(true);

    const forgedReconciliation = {
      ...deliveredReconciliation,
      source_follow_up_plan_schema_version:
        "content-pipeline-review-provider-execution-follow-up-forged-plan/v0.1",
    } as unknown as N14SourceReconciliation;
    const forgedValidation = validateProviderExecutionFollowUpN14SourceContract(
      deliveredPlan,
      forgedReconciliation
    );

    expect(forgedValidation.ok).toBe(false);
    expect(forgedValidation.issues.map((issue) => issue.code)).toContain(
      "source_reconciliation_contract_mismatch"
    );
    expect(() =>
      buildProviderExecutionFollowUpN14(deliveredPlan, forgedReconciliation)
    ).toThrow(/source_reconciliation_contract_mismatch/);
  });

  it("exports N14 routing into an executor-ready plan receipt and reconciliation trio", () => {
    type N14SourcePlan = Parameters<typeof validateProviderExecutionFollowUpN14SourceContract>[0];
    type N14SourceReconciliation = Parameters<typeof validateProviderExecutionFollowUpN14SourceContract>[1];

    const resultArtifactHandoff = {
      expected_schema_version: "content-pipeline-review-artifact/v0.1",
      generated_at: "2026-04-25T00:27:00.000Z",
      status: "ready_for_human_review",
    } as const;
    const requestKey =
      "content-pipeline:provider-execution-request:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z";
    const chainKey =
      "content-pipeline:provider-execution-chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z";
    const attemptKey =
      "content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-25T00:27:00.000Z";
    const unitId = "math_g8_linear_function_intro";
    const n13Schema =
      "content-pipeline-review-provider-execution-follow-up" +
      "-delivery-follow-up".repeat(13) +
      "/v0.1";
    const n13PlanSchema =
      "content-pipeline-review-provider-execution-follow-up" +
      "-delivery-follow-up".repeat(13) +
      "-plan/v0.1";
    const n13ReceiptSchema =
      "content-pipeline-review-provider-execution-follow-up" +
      "-delivery-follow-up".repeat(13) +
      "-receipt/v0.1";
    const n13ReconciliationSchema =
      "content-pipeline-review-provider-execution-follow-up" +
      "-delivery-follow-up".repeat(13) +
      "-reconciliation/v0.1";
    const n14PlanSchema =
      "content-pipeline-review-provider-execution-follow-up" +
      "-delivery-follow-up".repeat(14) +
      "-plan/v0.1";
    const n14ReceiptSchema =
      "content-pipeline-review-provider-execution-follow-up" +
      "-delivery-follow-up".repeat(14) +
      "-receipt/v0.1";
    const n14RepairState =
      "repair_follow_up" + "_delivery_follow_up".repeat(13) + "_required";
    const n14RepairAction =
      "open_manual_repair_follow_up" +
      "_delivery_follow_up".repeat(13) +
      "_item";
    const deliveredItemKey =
      "content-pipeline:manual_triage_queue:" +
      unitId +
      ":provider-follow-up" +
      "-delivery-follow-up".repeat(13) +
      "-repair:" +
      attemptKey;
    const emptyActiveItem = {
      item_key: null,
      human_queue: null,
      should_remain_open: false,
    } as const;

    const makeSourcePlan = (overrides: Partial<N14SourcePlan> = {}) => ({
      schema_version: n13PlanSchema,
      source_follow_up_schema_version: n13Schema,
      request_key: requestKey,
      chain_key: chainKey,
      attempt_key: attemptKey,
      unit_id: unitId,
      follow_up_state: "result_artifact_handoff_ready",
      follow_up_action: "defer_to_result_artifact_contract",
      follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed:
        true,
      preserved_result_artifact_handoff: resultArtifactHandoff,
      preserved_active_follow_up_item: emptyActiveItem,
      delivery_action: "none",
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      upsert: null,
      automation_step: "none",
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: false,
        provider_execution_allowed_without_human: false,
      },
      ...overrides,
    } as N14SourcePlan);

    const makeSourceReconciliation = (
      plan: N14SourcePlan,
      overrides: Partial<N14SourceReconciliation> = {}
    ) => ({
      schema_version: n13ReconciliationSchema,
      source_follow_up_plan_schema_version: plan.schema_version,
      source_follow_up_receipt_schema_version: n13ReceiptSchema,
      request_key: plan.request_key,
      chain_key: plan.chain_key,
      attempt_key: plan.attempt_key,
      unit_id: plan.unit_id,
      follow_up_state: plan.follow_up_state,
      follow_up_action: plan.follow_up_action,
      receipt_validation_ok: true,
      receipt_validation_issue_codes: [],
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      delivery_status: "applied",
      result_artifact_handoff: plan.preserved_result_artifact_handoff,
      preserved_active_follow_up_item: plan.preserved_active_follow_up_item,
      final_follow_up_item_key: plan.final_follow_up_item_key,
      final_follow_up_queue: plan.final_follow_up_queue,
      unresolved_operations: [],
      ...overrides,
    } as N14SourceReconciliation);

    const artifactSourcePlan = makeSourcePlan();
    const artifactN14 = buildProviderExecutionFollowUpN14(
      artifactSourcePlan,
      makeSourceReconciliation(artifactSourcePlan)
    );
    const artifactPlan = buildProviderExecutionFollowUpN14Plan(artifactN14);
    const artifactReceipt = buildProviderExecutionFollowUpN14Receipt(artifactPlan, {
      executed_at: "2026-04-25T00:28:00.000Z",
    });
    const artifactReconciliation = buildProviderExecutionFollowUpN14Reconciliation(
      artifactPlan,
      artifactReceipt
    );

    expect(artifactPlan).toMatchObject({
      schema_version: n14PlanSchema,
      source_follow_up_schema_version: artifactN14.schema_version,
      delivery_action: "none",
      final_follow_up_item_key: null,
      upsert: null,
    });
    expect(validateProviderExecutionFollowUpN14Plan(artifactN14, artifactPlan).ok).toBe(true);
    expect(validateProviderExecutionFollowUpN14PlanContract(artifactPlan).ok).toBe(true);
    expect(artifactReceipt).toMatchObject({
      schema_version: n14ReceiptSchema,
      overall_status: "applied",
      operations: [],
      final_follow_up_item_key: null,
    });
    expect(validateProviderExecutionFollowUpN14Receipt(artifactPlan, artifactReceipt).ok).toBe(true);
    expect(artifactReconciliation).toMatchObject({
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      receipt_validation_ok: true,
      delivery_status: "applied",
      final_follow_up_item_key: null,
      unresolved_operations: [],
    });
    expect(
      validateProviderExecutionFollowUpN14Reconciliation(
        artifactPlan,
        artifactReceipt,
        artifactReconciliation
      ).ok
    ).toBe(true);

    const deliveredSourcePlan = makeSourcePlan({
      follow_up_state: "manual_follow_up_item_delivered",
      follow_up_action: "none",
      preserved_result_artifact_handoff: null,
      final_follow_up_item_key: deliveredItemKey,
      final_follow_up_queue: "manual_triage_queue",
    } as Partial<N14SourcePlan>);
    const deliveredN14 = buildProviderExecutionFollowUpN14(
      deliveredSourcePlan,
      makeSourceReconciliation(deliveredSourcePlan, {
        result_artifact_handoff: null,
        final_follow_up_item_key: deliveredItemKey,
        final_follow_up_queue: "manual_triage_queue",
      } as Partial<N14SourceReconciliation>)
    );
    const deliveredPlan = buildProviderExecutionFollowUpN14Plan(deliveredN14);
    const deliveredReceipt = buildProviderExecutionFollowUpN14Receipt(deliveredPlan, {
      executed_at: "2026-04-25T00:29:00.000Z",
    });
    const deliveredReconciliation = buildProviderExecutionFollowUpN14Reconciliation(
      deliveredPlan,
      deliveredReceipt
    );

    expect(deliveredPlan).toMatchObject({
      delivery_action: "none",
      final_follow_up_item_key: deliveredItemKey,
      final_follow_up_queue: "manual_triage_queue",
      upsert: null,
    });
    expect(deliveredReceipt.operations).toHaveLength(0);
    expect(deliveredReconciliation).toMatchObject({
      reconciliation_status: "closed",
      final_follow_up_item_key: deliveredItemKey,
      final_follow_up_queue: "manual_triage_queue",
    });

    const repairSourcePlan = makeSourcePlan({
      follow_up_state: n14RepairState,
      follow_up_action: n14RepairAction,
      follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed:
        false,
      preserved_result_artifact_handoff: null,
      delivery_action: "create_follow_up_inbox_item",
      automation_step: "open_inbox_item",
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: true,
        provider_execution_allowed_without_human: false,
      },
    } as Partial<N14SourcePlan>);
    const repairN14 = buildProviderExecutionFollowUpN14(
      repairSourcePlan,
      makeSourceReconciliation(repairSourcePlan, {
        reconciliation_status: "action_required",
        recommended_follow_up:
          "manual_repair_provider_execution_follow_up" +
          "_delivery_follow_up".repeat(9),
        delivery_status: "failed",
        result_artifact_handoff: null,
        unresolved_operations: [
          {
            operation_key: "n14-source-repair-upsert-001",
            operation_type: "upsert",
            target_item_key:
              "content-pipeline:manual_triage_queue:" +
              unitId +
              ":n14-source-repair-target:" +
              attemptKey,
            status: "failed",
          },
        ],
      } as Partial<N14SourceReconciliation>)
    );
    const repairPlan = buildProviderExecutionFollowUpN14Plan(repairN14);
    const failedRepairReceipt = buildProviderExecutionFollowUpN14Receipt(repairPlan, {
      executed_at: "2026-04-25T00:30:00.000Z",
      upsert_status: "failed",
    });
    const failedRepairReconciliation = buildProviderExecutionFollowUpN14Reconciliation(
      repairPlan,
      failedRepairReceipt
    );

    expect(repairPlan).toMatchObject({
      delivery_action: "create_follow_up_inbox_item",
      final_follow_up_item_key: repairN14.follow_up_item?.item_key,
      automation_step: "open_inbox_item",
    });
    expect(repairPlan.upsert?.item_key).toBe(repairN14.follow_up_item?.item_key);
    expect(failedRepairReceipt).toMatchObject({
      overall_status: "failed",
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    expect(failedRepairReconciliation).toMatchObject({
      reconciliation_status: "action_required",
      recommended_follow_up:
        "manual_repair_provider_execution_follow_up" +
        "_delivery_follow_up".repeat(9),
      delivery_status: "failed",
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    expect(failedRepairReconciliation.unresolved_operations).toHaveLength(1);
    expect(
      validateProviderExecutionFollowUpN14Reconciliation(
        repairPlan,
        failedRepairReceipt,
        failedRepairReconciliation
      ).ok
    ).toBe(true);

    const malformedReceipt = {
      ...buildProviderExecutionFollowUpN14Receipt(repairPlan, {
        executed_at: "2026-04-25T00:31:00.000Z",
      }),
      operations: [
        {
          ...repairPlan.upsert!,
          operation_type: "upsert",
          target_item_key: repairPlan.upsert!.item_key,
          status: "skipped",
        },
      ],
    } as unknown as ReturnType<typeof buildProviderExecutionFollowUpN14Receipt>;
    const malformedReceiptValidation = validateProviderExecutionFollowUpN14Receipt(
      repairPlan,
      malformedReceipt
    );
    const malformedReconciliation = buildProviderExecutionFollowUpN14Reconciliation(
      repairPlan,
      malformedReceipt
    );

    expect(malformedReceiptValidation.ok).toBe(false);
    expect(malformedReceiptValidation.issues.map((issue) => issue.code)).toContain(
      "invalid_operation_status"
    );
    expect(malformedReconciliation).toMatchObject({
      receipt_validation_ok: false,
      receipt_validation_issue_codes: ["invalid_operation_status"],
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_receipt_triage",
      delivery_status: null,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      unresolved_operations: [],
    });
    expect(
      validateProviderExecutionFollowUpN14Reconciliation(
        repairPlan,
        malformedReceipt,
        malformedReconciliation
      ).ok
    ).toBe(true);

    const shapeInvalidReceipt = {
      ...buildProviderExecutionFollowUpN14Receipt(repairPlan, {
        executed_at: "2026-04-25T00:32:00.000Z",
      }),
    } as Record<string, unknown>;
    delete shapeInvalidReceipt.operations;
    const shapeInvalidReceiptValidation = validateProviderExecutionFollowUpN14Receipt(
      repairPlan,
      shapeInvalidReceipt as unknown as ReturnType<typeof buildProviderExecutionFollowUpN14Receipt>
    );
    const shapeInvalidReconciliation = buildProviderExecutionFollowUpN14Reconciliation(
      repairPlan,
      shapeInvalidReceipt as unknown as ReturnType<typeof buildProviderExecutionFollowUpN14Receipt>
    );

    expect(shapeInvalidReceiptValidation.ok).toBe(false);
    expect(shapeInvalidReceiptValidation.issues.map((issue) => issue.code)).toContain(
      "operation_count_mismatch"
    );
    expect(shapeInvalidReconciliation).toMatchObject({
      receipt_validation_ok: false,
      receipt_validation_issue_codes: ["operation_count_mismatch"],
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_receipt_triage",
      delivery_status: null,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      unresolved_operations: [],
    });

    const nonArrayOperationsReceipt = {
      ...buildProviderExecutionFollowUpN14Receipt(repairPlan, {
        executed_at: "2026-04-25T00:33:00.000Z",
      }),
      operations: "not-an-array",
    } as unknown as ReturnType<typeof buildProviderExecutionFollowUpN14Receipt>;
    const nonArrayOperationsValidation = validateProviderExecutionFollowUpN14Receipt(
      repairPlan,
      nonArrayOperationsReceipt
    );
    const nonArrayOperationsReconciliation = buildProviderExecutionFollowUpN14Reconciliation(
      repairPlan,
      nonArrayOperationsReceipt
    );

    expect(nonArrayOperationsValidation.ok).toBe(false);
    expect(nonArrayOperationsValidation.issues.map((issue) => issue.code)).toContain(
      "operation_count_mismatch"
    );
    expect(nonArrayOperationsReconciliation).toMatchObject({
      receipt_validation_ok: false,
      receipt_validation_issue_codes: ["operation_count_mismatch"],
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_receipt_triage",
      delivery_status: null,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      unresolved_operations: [],
    });
  });


  it("reduces N14 executor-ready trio into the N15 explicit routing contract", () => {
    type N14RoutingSourcePlan = Parameters<typeof validateProviderExecutionFollowUpN14SourceContract>[0];
    type N14RoutingSourceReconciliation = Parameters<typeof validateProviderExecutionFollowUpN14SourceContract>[1];

    const resultArtifactHandoff = {
      expected_schema_version: "content-pipeline-review-artifact/v0.1",
      generated_at: "2026-04-25T02:50:00.000Z",
      status: "ready_for_human_review",
    } as const;
    const requestKey =
      "content-pipeline:provider-execution-request:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z";
    const chainKey =
      "content-pipeline:provider-execution-chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z";
    const attemptKey =
      "content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-25T02:50:00.000Z";
    const unitId = "math_g8_linear_function_intro";
    const n13Schema =
      "content-pipeline-review-provider-execution-follow-up" +
      "-delivery-follow-up".repeat(13) +
      "/v0.1";
    const n13PlanSchema =
      "content-pipeline-review-provider-execution-follow-up" +
      "-delivery-follow-up".repeat(13) +
      "-plan/v0.1";
    const n13ReceiptSchema =
      "content-pipeline-review-provider-execution-follow-up" +
      "-delivery-follow-up".repeat(13) +
      "-receipt/v0.1";
    const n13ReconciliationSchema =
      "content-pipeline-review-provider-execution-follow-up" +
      "-delivery-follow-up".repeat(13) +
      "-reconciliation/v0.1";
    const n13RepairState =
      "repair_follow_up" + "_delivery_follow_up".repeat(12) + "_required";
    const n13RepairAction =
      "open_manual_repair_follow_up" +
      "_delivery_follow_up".repeat(12) +
      "_item";
    const n13RepairRecommendation =
      "manual_repair_provider_execution_follow_up" +
      "_delivery_follow_up".repeat(9);
    const n15Schema =
      "content-pipeline-review-provider-execution-follow-up" +
      "-delivery-follow-up".repeat(15) +
      "/v0.1";
    const n15RepairState =
      "repair_follow_up" + "_delivery_follow_up".repeat(14) + "_required";
    const n15RepairAction =
      "open_manual_repair_follow_up" +
      "_delivery_follow_up".repeat(14) +
      "_item";
    const n15DepthLabel =
      "provider_execution_follow_up" + "_delivery_follow_up".repeat(15);
    const n15RepairSuffix =
      "provider-follow-up" + "-delivery-follow-up".repeat(15) + "-repair";
    const n15ReceiptSuffix =
      "provider-follow-up" + "-delivery-follow-up".repeat(15) + "-receipt";
    const n16Schema =
      "content-pipeline-review-provider-execution-follow-up" +
      "-delivery-follow-up".repeat(16) +
      "/v0.1";
    const n16RepairState =
      "repair_follow_up" + "_delivery_follow_up".repeat(15) + "_required";
    const n16RepairAction =
      "open_manual_repair_follow_up" +
      "_delivery_follow_up".repeat(15) +
      "_item";
    const n16DepthLabel =
      "provider_execution_follow_up" + "_delivery_follow_up".repeat(16);
    const n16RepairSuffix =
      "provider-follow-up" + "-delivery-follow-up".repeat(16) + "-repair";
    const n16ReceiptSuffix =
      "provider-follow-up" + "-delivery-follow-up".repeat(16) + "-receipt";
    const n17Schema =
      "content-pipeline-review-provider-execution-follow-up" +
      "-delivery-follow-up".repeat(17) +
      "/v0.1";
    const n17RepairState =
      "repair_follow_up" + "_delivery_follow_up".repeat(16) + "_required";
    const n17RepairAction =
      "open_manual_repair_follow_up" +
      "_delivery_follow_up".repeat(16) +
      "_item";
    const n17DepthLabel =
      "provider_execution_follow_up" + "_delivery_follow_up".repeat(17);
    const n17RepairSuffix =
      "provider-follow-up" + "-delivery-follow-up".repeat(17) + "-repair";
    const n17ReceiptSuffix =
      "provider-follow-up" + "-delivery-follow-up".repeat(17) + "-receipt";
    const deliveredItemKey =
      "content-pipeline:manual_triage_queue:" +
      unitId +
      ":provider-follow-up" +
      "-delivery-follow-up".repeat(14) +
      "-repair:" +
      attemptKey;
    const emptyActiveItem = {
      item_key: null,
      human_queue: null,
      should_remain_open: false,
    } as const;

    const makeSourcePlan = (overrides: Partial<N14RoutingSourcePlan> = {}) => ({
      schema_version: n13PlanSchema,
      source_follow_up_schema_version: n13Schema,
      request_key: requestKey,
      chain_key: chainKey,
      attempt_key: attemptKey,
      unit_id: unitId,
      follow_up_state: "result_artifact_handoff_ready",
      follow_up_action: "defer_to_result_artifact_contract",
      follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed:
        true,
      preserved_result_artifact_handoff: resultArtifactHandoff,
      preserved_active_follow_up_item: emptyActiveItem,
      delivery_action: "none",
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      upsert: null,
      automation_step: "none",
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: false,
        provider_execution_allowed_without_human: false,
      },
      ...overrides,
    } as N14RoutingSourcePlan);

    const makeSourceReconciliation = (
      plan: N14RoutingSourcePlan,
      overrides: Partial<N14RoutingSourceReconciliation> = {}
    ) => ({
      schema_version: n13ReconciliationSchema,
      source_follow_up_plan_schema_version: plan.schema_version,
      source_follow_up_receipt_schema_version: n13ReceiptSchema,
      request_key: plan.request_key,
      chain_key: plan.chain_key,
      attempt_key: plan.attempt_key,
      unit_id: plan.unit_id,
      follow_up_state: plan.follow_up_state,
      follow_up_action: plan.follow_up_action,
      receipt_validation_ok: true,
      receipt_validation_issue_codes: [],
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      delivery_status: "applied",
      result_artifact_handoff: plan.preserved_result_artifact_handoff,
      preserved_active_follow_up_item: plan.preserved_active_follow_up_item,
      final_follow_up_item_key: plan.final_follow_up_item_key,
      final_follow_up_queue: plan.final_follow_up_queue,
      unresolved_operations: [],
      ...overrides,
    } as N14RoutingSourceReconciliation);

    const buildN14Trio = (
      sourcePlan: N14RoutingSourcePlan,
      sourceReconciliation: N14RoutingSourceReconciliation,
      upsertStatus?: "applied" | "already_applied" | "failed"
    ) => {
      const n14 = buildProviderExecutionFollowUpN14(sourcePlan, sourceReconciliation);
      const plan = buildProviderExecutionFollowUpN14Plan(n14);
      const receipt = buildProviderExecutionFollowUpN14Receipt(plan, {
        executed_at: "2026-04-25T02:51:00.000Z",
        ...(upsertStatus ? { upsert_status: upsertStatus } : {}),
      });
      const reconciliation = buildProviderExecutionFollowUpN14Reconciliation(
        plan,
        receipt
      );
      return { n14, plan, receipt, reconciliation };
    };

    const artifactSourcePlan = makeSourcePlan();
    const artifactTrio = buildN14Trio(
      artifactSourcePlan,
      makeSourceReconciliation(artifactSourcePlan)
    );
    const artifactN15 = buildProviderExecutionFollowUpN15(
      artifactTrio.plan,
      artifactTrio.reconciliation
    );

    expect(validateProviderExecutionFollowUpN15SourceContract(
      artifactTrio.plan,
      artifactTrio.reconciliation
    ).ok).toBe(true);
    expect(artifactN15).toMatchObject({
      schema_version: n15Schema,
      follow_up_state: "result_artifact_handoff_ready",
      follow_up_action: "defer_to_result_artifact_contract",
      result_artifact_handoff: resultArtifactHandoff,
      automation_step: "none",
      follow_up_item: null,
    });
    expect(validateProviderExecutionFollowUpN15(
      artifactTrio.plan,
      artifactTrio.reconciliation,
      artifactN15
    ).ok).toBe(true);

    const deliveredSourcePlan = makeSourcePlan({
      follow_up_state: "manual_follow_up_item_delivered",
      follow_up_action: "none",
      preserved_result_artifact_handoff: null,
      final_follow_up_item_key: deliveredItemKey,
      final_follow_up_queue: "manual_triage_queue",
    } as Partial<N14RoutingSourcePlan>);
    const deliveredTrio = buildN14Trio(
      deliveredSourcePlan,
      makeSourceReconciliation(deliveredSourcePlan, {
        result_artifact_handoff: null,
        final_follow_up_item_key: deliveredItemKey,
        final_follow_up_queue: "manual_triage_queue",
      } as Partial<N14RoutingSourceReconciliation>)
    );
    const deliveredN15 = buildProviderExecutionFollowUpN15(
      deliveredTrio.plan,
      deliveredTrio.reconciliation
    );

    expect(deliveredN15).toMatchObject({
      follow_up_state: "manual_follow_up_item_delivered",
      follow_up_action: "none",
      active_follow_up_item: {
        item_key: deliveredItemKey,
        human_queue: "manual_triage_queue",
        should_remain_open: true,
      },
      follow_up_item: null,
    });
    expect(validateProviderExecutionFollowUpN15(
      deliveredTrio.plan,
      deliveredTrio.reconciliation,
      deliveredN15
    ).ok).toBe(true);

    const repairSourcePlan = makeSourcePlan({
      follow_up_state: n13RepairState,
      follow_up_action: n13RepairAction,
      follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed:
        false,
      preserved_result_artifact_handoff: null,
      delivery_action: "create_follow_up_inbox_item",
      automation_step: "open_inbox_item",
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: true,
        provider_execution_allowed_without_human: false,
      },
    } as Partial<N14RoutingSourcePlan>);
    const repairTrio = buildN14Trio(
      repairSourcePlan,
      makeSourceReconciliation(repairSourcePlan, {
        reconciliation_status: "action_required",
        recommended_follow_up: n13RepairRecommendation,
        delivery_status: "failed",
        result_artifact_handoff: null,
        unresolved_operations: [
          {
            operation_key: "n14-repair-upsert-001",
            operation_type: "upsert",
            target_item_key:
              "content-pipeline:manual_triage_queue:" +
              unitId +
              ":n14-repair-target:" +
              attemptKey,
            status: "failed",
          },
        ],
      } as Partial<N14RoutingSourceReconciliation>),
      "failed"
    );
    const repairN15 = buildProviderExecutionFollowUpN15(
      repairTrio.plan,
      repairTrio.reconciliation
    );

    expect(repairN15.follow_up_item?.item_key).toContain(n15RepairSuffix);
    expect(repairN15.follow_up_item?.labels).toContain(n15DepthLabel);
    expect(repairN15).toMatchObject({
      follow_up_state: n15RepairState,
      follow_up_action: n15RepairAction,
      automation_step: "open_inbox_item",
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: true,
      },
    });
    expect(validateProviderExecutionFollowUpN15(
      repairTrio.plan,
      repairTrio.reconciliation,
      repairN15
    ).ok).toBe(true);

    const malformedReceipt = {
      ...buildProviderExecutionFollowUpN14Receipt(repairTrio.plan, {
        executed_at: "2026-04-25T02:52:00.000Z",
      }),
      operations: [
        {
          ...repairTrio.plan.upsert!,
          operation_type: "upsert",
          target_item_key: repairTrio.plan.upsert!.item_key,
          status: "skipped",
        },
      ],
    } as unknown as ReturnType<typeof buildProviderExecutionFollowUpN14Receipt>;
    const malformedReconciliation = buildProviderExecutionFollowUpN14Reconciliation(
      repairTrio.plan,
      malformedReceipt
    );
    const receiptTriageN15 = buildProviderExecutionFollowUpN15(
      repairTrio.plan,
      malformedReconciliation
    );

    expect(receiptTriageN15.follow_up_item?.item_key).toContain(n15ReceiptSuffix);
    expect(receiptTriageN15.follow_up_item?.labels).toContain(n15DepthLabel);
    expect(receiptTriageN15.follow_up_item?.labels).toContain(
      "receipt_validation:invalid_operation_status"
    );
    expect(receiptTriageN15).toMatchObject({
      follow_up_state: "receipt_triage_required",
      follow_up_action: "open_manual_receipt_triage_item",
      result_artifact_handoff: null,
      active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
    });
    expect(validateProviderExecutionFollowUpN15(
      repairTrio.plan,
      malformedReconciliation,
      receiptTriageN15
    ).ok).toBe(true);

    const artifactN15Plan = buildProviderExecutionFollowUpN15Plan(artifactN15);
    const artifactN15Receipt = buildProviderExecutionFollowUpN15Receipt(
      artifactN15Plan,
      { executed_at: "2026-04-25T03:38:00.000Z" }
    );
    const artifactN15Reconciliation = buildProviderExecutionFollowUpN15Reconciliation(
      artifactN15Plan,
      artifactN15Receipt
    );

    expect(artifactN15Plan).toMatchObject({
      delivery_action: "none",
      upsert: null,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      automation_step: "none",
    });
    expect(validateProviderExecutionFollowUpN15Plan(artifactN15, artifactN15Plan).ok).toBe(true);
    expect(validateProviderExecutionFollowUpN15PlanContract(artifactN15Plan).ok).toBe(true);
    expect(artifactN15Receipt).toMatchObject({
      overall_status: "applied",
      operations: [],
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    expect(validateProviderExecutionFollowUpN15Receipt(artifactN15Plan, artifactN15Receipt).ok).toBe(true);
    expect(artifactN15Reconciliation).toMatchObject({
      receipt_validation_ok: true,
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      result_artifact_handoff: resultArtifactHandoff,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    expect(validateProviderExecutionFollowUpN15Reconciliation(
      artifactN15Plan,
      artifactN15Receipt,
      artifactN15Reconciliation
    ).ok).toBe(true);

    const deliveredN15Plan = buildProviderExecutionFollowUpN15Plan(deliveredN15);
    const deliveredN15Receipt = buildProviderExecutionFollowUpN15Receipt(
      deliveredN15Plan,
      { executed_at: "2026-04-25T03:39:00.000Z" }
    );
    const deliveredN15Reconciliation = buildProviderExecutionFollowUpN15Reconciliation(
      deliveredN15Plan,
      deliveredN15Receipt
    );

    expect(deliveredN15Plan).toMatchObject({
      delivery_action: "none",
      upsert: null,
      final_follow_up_item_key: deliveredItemKey,
      final_follow_up_queue: "manual_triage_queue",
      automation_step: "none",
    });
    expect(validateProviderExecutionFollowUpN15Plan(deliveredN15, deliveredN15Plan).ok).toBe(true);
    expect(validateProviderExecutionFollowUpN15Receipt(deliveredN15Plan, deliveredN15Receipt).ok).toBe(true);
    expect(deliveredN15Reconciliation).toMatchObject({
      receipt_validation_ok: true,
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      final_follow_up_item_key: deliveredItemKey,
      final_follow_up_queue: "manual_triage_queue",
    });
    expect(validateProviderExecutionFollowUpN15Reconciliation(
      deliveredN15Plan,
      deliveredN15Receipt,
      deliveredN15Reconciliation
    ).ok).toBe(true);

    const repairN15Plan = buildProviderExecutionFollowUpN15Plan(repairN15);
    const repairN15Receipt = buildProviderExecutionFollowUpN15Receipt(
      repairN15Plan,
      {
        executed_at: "2026-04-25T03:40:00.000Z",
        upsert_status: "failed",
      }
    );
    const repairN15Reconciliation = buildProviderExecutionFollowUpN15Reconciliation(
      repairN15Plan,
      repairN15Receipt
    );

    expect(repairN15Plan.upsert?.operation_key).toContain(n15RepairSuffix);
    expect(repairN15Plan).toMatchObject({
      delivery_action: "create_follow_up_inbox_item",
      final_follow_up_item_key: repairN15.follow_up_item?.item_key,
      final_follow_up_queue: "manual_triage_queue",
      automation_step: "open_inbox_item",
    });
    expect(validateProviderExecutionFollowUpN15Plan(repairN15, repairN15Plan).ok).toBe(true);
    expect(repairN15Receipt).toMatchObject({
      overall_status: "failed",
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    expect(validateProviderExecutionFollowUpN15Receipt(repairN15Plan, repairN15Receipt).ok).toBe(true);
    expect(repairN15Reconciliation).toMatchObject({
      receipt_validation_ok: true,
      reconciliation_status: "action_required",
      recommended_follow_up: n13RepairRecommendation,
      delivery_status: "failed",
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    expect(validateProviderExecutionFollowUpN15Reconciliation(
      repairN15Plan,
      repairN15Receipt,
      repairN15Reconciliation
    ).ok).toBe(true);

    const receiptTriageN15Plan = buildProviderExecutionFollowUpN15Plan(receiptTriageN15);
    const malformedN15Receipt = {
      ...buildProviderExecutionFollowUpN15Receipt(receiptTriageN15Plan, {
        executed_at: "2026-04-25T03:41:00.000Z",
      }),
      operations: [
        {
          ...receiptTriageN15Plan.upsert!,
          operation_type: "upsert",
          target_item_key: receiptTriageN15Plan.upsert!.item_key,
          status: "skipped",
        },
      ],
    } as unknown as ReturnType<typeof buildProviderExecutionFollowUpN15Receipt>;
    const malformedN15Reconciliation = buildProviderExecutionFollowUpN15Reconciliation(
      receiptTriageN15Plan,
      malformedN15Receipt
    );

    expect(validateProviderExecutionFollowUpN15Receipt(
      receiptTriageN15Plan,
      malformedN15Receipt
    ).ok).toBe(false);
    expect(malformedN15Reconciliation).toMatchObject({
      receipt_validation_ok: false,
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_receipt_triage",
      delivery_status: null,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      unresolved_operations: [],
    });
    expect(validateProviderExecutionFollowUpN15Reconciliation(
      receiptTriageN15Plan,
      malformedN15Receipt,
      malformedN15Reconciliation
    ).ok).toBe(true);

    const artifactN16 = buildProviderExecutionFollowUpN16(
      artifactN15Plan,
      artifactN15Reconciliation
    );

    expect(validateProviderExecutionFollowUpN16SourceContract(
      artifactN15Plan,
      artifactN15Reconciliation
    ).ok).toBe(true);
    expect(artifactN16).toMatchObject({
      schema_version: n16Schema,
      follow_up_state: "result_artifact_handoff_ready",
      follow_up_action: "defer_to_result_artifact_contract",
      result_artifact_handoff: resultArtifactHandoff,
      automation_step: "none",
      follow_up_item: null,
    });
    expect(validateProviderExecutionFollowUpN16(
      artifactN15Plan,
      artifactN15Reconciliation,
      artifactN16
    ).ok).toBe(true);

    const deliveredN16 = buildProviderExecutionFollowUpN16(
      deliveredN15Plan,
      deliveredN15Reconciliation
    );

    expect(deliveredN16).toMatchObject({
      follow_up_state: "manual_follow_up_item_delivered",
      follow_up_action: "none",
      active_follow_up_item: {
        item_key: deliveredItemKey,
        human_queue: "manual_triage_queue",
        should_remain_open: true,
      },
      follow_up_item: null,
    });
    expect(validateProviderExecutionFollowUpN16(
      deliveredN15Plan,
      deliveredN15Reconciliation,
      deliveredN16
    ).ok).toBe(true);

    const repairN16 = buildProviderExecutionFollowUpN16(
      repairN15Plan,
      repairN15Reconciliation
    );

    expect(repairN16.follow_up_item?.item_key).toContain(n16RepairSuffix);
    expect(repairN16.follow_up_item?.labels).toContain(n16DepthLabel);
    expect(repairN16).toMatchObject({
      follow_up_state: n16RepairState,
      follow_up_action: n16RepairAction,
      automation_step: "open_inbox_item",
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: true,
      },
    });
    expect(validateProviderExecutionFollowUpN16(
      repairN15Plan,
      repairN15Reconciliation,
      repairN16
    ).ok).toBe(true);

    const receiptTriageN16 = buildProviderExecutionFollowUpN16(
      receiptTriageN15Plan,
      malformedN15Reconciliation
    );

    expect(receiptTriageN16.follow_up_item?.item_key).toContain(n16ReceiptSuffix);
    expect(receiptTriageN16.follow_up_item?.labels).toContain(n16DepthLabel);
    expect(receiptTriageN16.follow_up_item?.labels).toContain(
      "receipt_validation:invalid_operation_status"
    );
    expect(receiptTriageN16).toMatchObject({
      follow_up_state: "receipt_triage_required",
      follow_up_action: "open_manual_receipt_triage_item",
      result_artifact_handoff: null,
      active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
    });
    expect(validateProviderExecutionFollowUpN16(
      receiptTriageN15Plan,
      malformedN15Reconciliation,
      receiptTriageN16
    ).ok).toBe(true);

    const artifactN16Plan = buildProviderExecutionFollowUpN16Plan(artifactN16);
    const artifactN16Receipt = buildProviderExecutionFollowUpN16Receipt(
      artifactN16Plan,
      { executed_at: "2026-04-25T04:12:00.000Z" }
    );
    const artifactN16Reconciliation = buildProviderExecutionFollowUpN16Reconciliation(
      artifactN16Plan,
      artifactN16Receipt
    );

    expect(artifactN16Plan).toMatchObject({
      delivery_action: "none",
      upsert: null,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      automation_step: "none",
    });
    expect(validateProviderExecutionFollowUpN16Plan(artifactN16, artifactN16Plan).ok).toBe(
      true
    );
    expect(validateProviderExecutionFollowUpN16PlanContract(artifactN16Plan).ok).toBe(
      true
    );
    expect(artifactN16Receipt).toMatchObject({
      overall_status: "applied",
      operations: [],
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    expect(
      validateProviderExecutionFollowUpN16Receipt(artifactN16Plan, artifactN16Receipt).ok
    ).toBe(true);
    expect(artifactN16Reconciliation).toMatchObject({
      receipt_validation_ok: true,
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      result_artifact_handoff: resultArtifactHandoff,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    expect(
      validateProviderExecutionFollowUpN16Reconciliation(
        artifactN16Plan,
        artifactN16Receipt,
        artifactN16Reconciliation
      ).ok
    ).toBe(true);

    const deliveredN16Plan = buildProviderExecutionFollowUpN16Plan(deliveredN16);
    const deliveredN16Receipt = buildProviderExecutionFollowUpN16Receipt(
      deliveredN16Plan,
      { executed_at: "2026-04-25T04:13:00.000Z" }
    );
    const deliveredN16Reconciliation = buildProviderExecutionFollowUpN16Reconciliation(
      deliveredN16Plan,
      deliveredN16Receipt
    );

    expect(deliveredN16Plan).toMatchObject({
      delivery_action: "none",
      upsert: null,
      final_follow_up_item_key: deliveredItemKey,
      final_follow_up_queue: "manual_triage_queue",
      automation_step: "none",
    });
    expect(validateProviderExecutionFollowUpN16Plan(deliveredN16, deliveredN16Plan).ok).toBe(
      true
    );
    expect(
      validateProviderExecutionFollowUpN16Receipt(deliveredN16Plan, deliveredN16Receipt).ok
    ).toBe(true);
    expect(deliveredN16Reconciliation).toMatchObject({
      receipt_validation_ok: true,
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      final_follow_up_item_key: deliveredItemKey,
      final_follow_up_queue: "manual_triage_queue",
    });
    expect(
      validateProviderExecutionFollowUpN16Reconciliation(
        deliveredN16Plan,
        deliveredN16Receipt,
        deliveredN16Reconciliation
      ).ok
    ).toBe(true);

    const repairN16Plan = buildProviderExecutionFollowUpN16Plan(repairN16);
    const repairN16Receipt = buildProviderExecutionFollowUpN16Receipt(
      repairN16Plan,
      { executed_at: "2026-04-25T04:14:00.000Z", upsert_status: "failed" }
    );
    const repairN16Reconciliation = buildProviderExecutionFollowUpN16Reconciliation(
      repairN16Plan,
      repairN16Receipt
    );

    expect(repairN16Plan.delivery_action).toBe("create_follow_up_inbox_item");
    expect(repairN16Plan.upsert?.item_key).toContain(n16RepairSuffix);
    expect(validateProviderExecutionFollowUpN16Plan(repairN16, repairN16Plan).ok).toBe(
      true
    );
    expect(
      validateProviderExecutionFollowUpN16Receipt(repairN16Plan, repairN16Receipt).ok
    ).toBe(true);
    expect(repairN16Reconciliation).toMatchObject({
      receipt_validation_ok: true,
      reconciliation_status: "action_required",
      recommended_follow_up:
        "manual_repair_provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up",
      delivery_status: "failed",
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    expect(
      validateProviderExecutionFollowUpN16Reconciliation(
        repairN16Plan,
        repairN16Receipt,
        repairN16Reconciliation
      ).ok
    ).toBe(true);

    const receiptTriageN16Plan = buildProviderExecutionFollowUpN16Plan(
      receiptTriageN16
    );
    const receiptTriageN16Receipt = buildProviderExecutionFollowUpN16Receipt(
      receiptTriageN16Plan,
      { executed_at: "2026-04-25T04:15:00.000Z" }
    );
    const malformedN16Receipt = {
      ...receiptTriageN16Receipt,
      operations: receiptTriageN16Receipt.operations.map((operation) => ({
        ...operation,
        status: "skipped",
      })),
    } as unknown as ReturnType<typeof buildProviderExecutionFollowUpN16Receipt>;
    const malformedN16Reconciliation = buildProviderExecutionFollowUpN16Reconciliation(
      receiptTriageN16Plan,
      malformedN16Receipt
    );

    expect(
      validateProviderExecutionFollowUpN16Receipt(receiptTriageN16Plan, malformedN16Receipt)
        .ok
    ).toBe(false);
    expect(malformedN16Reconciliation).toMatchObject({
      receipt_validation_ok: false,
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_receipt_triage",
      delivery_status: null,
      result_artifact_handoff: null,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      unresolved_operations: [],
    });
    expect(
      validateProviderExecutionFollowUpN16Reconciliation(
        receiptTriageN16Plan,
        malformedN16Receipt,
        malformedN16Reconciliation
      ).ok
    ).toBe(true);

    const nullOperationN16Receipt = {
      ...receiptTriageN16Receipt,
      final_follow_up_item_key: receiptTriageN16Plan.final_follow_up_item_key,
      final_follow_up_queue: receiptTriageN16Plan.final_follow_up_queue,
      operations: [null],
    } as unknown as ReturnType<typeof buildProviderExecutionFollowUpN16Receipt>;
    const nullOperationN16ReceiptValidation = validateProviderExecutionFollowUpN16Receipt(
      receiptTriageN16Plan,
      nullOperationN16Receipt
    );
    const nullOperationN16Reconciliation =
      buildProviderExecutionFollowUpN16Reconciliation(
        receiptTriageN16Plan,
        nullOperationN16Receipt
      );

    expect(nullOperationN16ReceiptValidation.ok).toBe(false);
    expect(nullOperationN16ReceiptValidation.issues.map((issue) => issue.code)).toContain(
      "invalid_operation_entry"
    );
    expect(nullOperationN16Reconciliation).toMatchObject({
      receipt_validation_ok: false,
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_receipt_triage",
      delivery_status: null,
      result_artifact_handoff: null,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      unresolved_operations: [],
    });
    expect(
      validateProviderExecutionFollowUpN16Reconciliation(
        receiptTriageN16Plan,
        nullOperationN16Receipt,
        nullOperationN16Reconciliation
      ).ok
    ).toBe(true);

    const artifactN17 = buildProviderExecutionFollowUpN17(
      artifactN16Plan,
      artifactN16Reconciliation
    );

    expect(validateProviderExecutionFollowUpN17SourceContract(
      artifactN16Plan,
      artifactN16Reconciliation
    ).ok).toBe(true);
    expect(artifactN17).toMatchObject({
      schema_version: n17Schema,
      follow_up_state: "result_artifact_handoff_ready",
      follow_up_action: "defer_to_result_artifact_contract",
      result_artifact_handoff: resultArtifactHandoff,
      automation_step: "none",
      follow_up_item: null,
    });
    expect(validateProviderExecutionFollowUpN17(
      artifactN16Plan,
      artifactN16Reconciliation,
      artifactN17
    ).ok).toBe(true);

    const deliveredN17 = buildProviderExecutionFollowUpN17(
      deliveredN16Plan,
      deliveredN16Reconciliation
    );

    expect(deliveredN17).toMatchObject({
      follow_up_state: "manual_follow_up_item_delivered",
      follow_up_action: "none",
      active_follow_up_item: {
        item_key: deliveredItemKey,
        human_queue: "manual_triage_queue",
        should_remain_open: true,
      },
      follow_up_item: null,
    });
    expect(validateProviderExecutionFollowUpN17(
      deliveredN16Plan,
      deliveredN16Reconciliation,
      deliveredN17
    ).ok).toBe(true);

    const repairN17 = buildProviderExecutionFollowUpN17(
      repairN16Plan,
      repairN16Reconciliation
    );

    expect(repairN17.follow_up_item?.item_key).toContain(n17RepairSuffix);
    expect(repairN17.follow_up_item?.labels).toContain(n17DepthLabel);
    expect(repairN17).toMatchObject({
      follow_up_state: n17RepairState,
      follow_up_action: n17RepairAction,
      automation_step: "open_inbox_item",
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: true,
      },
    });
    expect(validateProviderExecutionFollowUpN17(
      repairN16Plan,
      repairN16Reconciliation,
      repairN17
    ).ok).toBe(true);

    const repairedN16Receipt = buildProviderExecutionFollowUpN16Receipt(
      repairN16Plan,
      { executed_at: "2026-04-25T04:15:30.000Z" }
    );
    const repairedN16Reconciliation = buildProviderExecutionFollowUpN16Reconciliation(
      repairN16Plan,
      repairedN16Receipt
    );
    const repairedN17 = buildProviderExecutionFollowUpN17(
      repairN16Plan,
      repairedN16Reconciliation
    );

    expect(repairedN16Reconciliation).toMatchObject({
      receipt_validation_ok: true,
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      delivery_status: "applied",
      final_follow_up_item_key: repairN16Plan.final_follow_up_item_key,
      final_follow_up_queue: repairN16Plan.final_follow_up_queue,
    });
    expect(repairedN17).toMatchObject({
      follow_up_state: "manual_follow_up_item_delivered",
      follow_up_action: "none",
      active_follow_up_item: {
        item_key: repairN16Plan.final_follow_up_item_key,
        human_queue: repairN16Plan.final_follow_up_queue,
        should_remain_open: true,
      },
      automation_step: "none",
      follow_up_item: null,
    });
    expect(validateProviderExecutionFollowUpN17(
      repairN16Plan,
      repairedN16Reconciliation,
      repairedN17
    ).ok).toBe(true);

    const receiptTriageN17 = buildProviderExecutionFollowUpN17(
      receiptTriageN16Plan,
      nullOperationN16Reconciliation
    );

    expect(receiptTriageN17.follow_up_item?.item_key).toContain(n17ReceiptSuffix);
    expect(receiptTriageN17.follow_up_item?.labels).toContain(n17DepthLabel);
    expect(
      receiptTriageN17.follow_up_item?.labels.some((label) =>
        label.includes("invalid_operation_entry")
      )
    ).toBe(true);
    expect(receiptTriageN17).toMatchObject({
      follow_up_state: "receipt_triage_required",
      follow_up_action: "open_manual_receipt_triage_item",
      result_artifact_handoff: null,
      active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
    });
    expect(validateProviderExecutionFollowUpN17(
      receiptTriageN16Plan,
      nullOperationN16Reconciliation,
      receiptTriageN17
    ).ok).toBe(true);
    const malformedN17Validation = validateProviderExecutionFollowUpN17(
      deliveredN16Plan,
      deliveredN16Reconciliation,
      null as unknown as typeof deliveredN17
    );

    expect(malformedN17Validation.ok).toBe(false);
    expect(malformedN17Validation.issues.map((issue) => issue.code)).toContain(
      "invalid_follow_up_schema_version"
    );
    expect(JSON.stringify(malformedN17Validation)).not.toContain("Cannot read properties");
    expect(JSON.stringify(malformedN17Validation)).not.toContain("TypeError");

    const closedN17Plan = buildProviderExecutionFollowUpN17Plan(deliveredN17);
    expect(closedN17Plan).toMatchObject({
      source_follow_up_schema_version: deliveredN17.schema_version,
      delivery_action: "none",
      final_follow_up_item_key: deliveredN17.active_follow_up_item.item_key,
      final_follow_up_queue: deliveredN17.active_follow_up_item.human_queue,
      upsert: null,
    });
    expect(validateProviderExecutionFollowUpN17Plan(deliveredN17, closedN17Plan).ok).toBe(
      true
    );
    expect(validateProviderExecutionFollowUpN17PlanContract(closedN17Plan).ok).toBe(
      true
    );
    const closedN17Receipt = buildProviderExecutionFollowUpN17Receipt(closedN17Plan, {
      executed_at: "2026-04-24T04:00:00.000Z",
    });
    expect(closedN17Receipt).toMatchObject({
      source_follow_up_plan_schema_version: closedN17Plan.schema_version,
      overall_status: "applied",
      operations: [],
    });
    expect(validateProviderExecutionFollowUpN17Receipt(closedN17Plan, closedN17Receipt).ok).toBe(
      true
    );
    const closedN17Reconciliation = buildProviderExecutionFollowUpN17Reconciliation(
      closedN17Plan,
      closedN17Receipt
    );
    expect(closedN17Reconciliation).toMatchObject({
      source_follow_up_plan_schema_version: closedN17Plan.schema_version,
      source_follow_up_receipt_schema_version: closedN17Receipt.schema_version,
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      receipt_validation_ok: true,
      unresolved_operations: [],
    });
    expect(
      validateProviderExecutionFollowUpN17Reconciliation(
        closedN17Plan,
        closedN17Receipt,
        closedN17Reconciliation
      ).ok
    ).toBe(true);

    const triageN17Plan = buildProviderExecutionFollowUpN17Plan(receiptTriageN17);
    expect(triageN17Plan.delivery_action).toBe("create_follow_up_inbox_item");
    expect(triageN17Plan.upsert?.item_key).toBe(receiptTriageN17.follow_up_item?.item_key);
    const failedN17Receipt = buildProviderExecutionFollowUpN17Receipt(triageN17Plan, {
      executed_at: "2026-04-24T04:10:00.000Z",
      upsert_status: "failed",
    });
    expect(failedN17Receipt).toMatchObject({
      overall_status: "failed",
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
    });
    const failedN17Reconciliation = buildProviderExecutionFollowUpN17Reconciliation(
      triageN17Plan,
      failedN17Receipt
    );
    expect(failedN17Reconciliation).toMatchObject({
      reconciliation_status: "action_required",
      delivery_status: "failed",
      unresolved_operations: [
        {
          operation_key: triageN17Plan.upsert?.operation_key,
          target_item_key: triageN17Plan.upsert?.item_key,
          status: "failed",
        },
      ],
    });
    expect(
      validateProviderExecutionFollowUpN17Reconciliation(
        triageN17Plan,
        failedN17Receipt,
        failedN17Reconciliation
      ).ok
    ).toBe(true);

    const forgedN16Reconciliation = {
      ...deliveredN16Reconciliation,
      source_follow_up_receipt_schema_version:
        "content-pipeline-review-provider-execution-follow-up-forged-receipt/v0.1",
    } as unknown as typeof deliveredN16Reconciliation;
    const forgedN17Validation = validateProviderExecutionFollowUpN17SourceContract(
      deliveredN16Plan,
      forgedN16Reconciliation
    );

    expect(forgedN17Validation.ok).toBe(false);
    expect(forgedN17Validation.issues.map((issue) => issue.code)).toContain(
      "source_reconciliation_contract_mismatch"
    );
    expect(() =>
      buildProviderExecutionFollowUpN17(deliveredN16Plan, forgedN16Reconciliation)
    ).toThrow(/source_reconciliation_contract_mismatch/);

    const forgedN15Reconciliation = {
      ...deliveredN15Reconciliation,
      source_follow_up_receipt_schema_version:
        "content-pipeline-review-provider-execution-follow-up-forged-receipt/v0.1",
    } as unknown as typeof deliveredN15Reconciliation;
    const forgedN16Validation = validateProviderExecutionFollowUpN16SourceContract(
      deliveredN15Plan,
      forgedN15Reconciliation
    );

    expect(forgedN16Validation.ok).toBe(false);
    expect(forgedN16Validation.issues.map((issue) => issue.code)).toContain(
      "source_reconciliation_contract_mismatch"
    );
    expect(() =>
      buildProviderExecutionFollowUpN16(deliveredN15Plan, forgedN15Reconciliation)
    ).toThrow(/source_reconciliation_contract_mismatch/);

    const forgedReconciliation = {
      ...deliveredTrio.reconciliation,
      source_follow_up_receipt_schema_version:
        "content-pipeline-review-provider-execution-follow-up-forged-receipt/v0.1",
    } as unknown as typeof deliveredTrio.reconciliation;
    const forgedValidation = validateProviderExecutionFollowUpN15SourceContract(
      deliveredTrio.plan,
      forgedReconciliation
    );

    expect(forgedValidation.ok).toBe(false);
    expect(forgedValidation.issues.map((issue) => issue.code)).toContain(
      "source_reconciliation_contract_mismatch"
    );
    expect(() =>
      buildProviderExecutionFollowUpN15(deliveredTrio.plan, forgedReconciliation)
    ).toThrow(/source_reconciliation_contract_mismatch/);

    const forgedClosedRepairReconciliation = {
      ...repairTrio.reconciliation,
      receipt_validation_ok: true,
      receipt_validation_issue_codes: [],
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      delivery_status: "applied",
      final_follow_up_item_key: repairTrio.plan.final_follow_up_item_key,
      final_follow_up_queue: repairTrio.plan.final_follow_up_queue,
      unresolved_operations: [],
    } as unknown as typeof repairTrio.reconciliation;
    const forgedClosedRepairValidation =
      validateProviderExecutionFollowUpN15SourceContract(
        repairTrio.plan,
        forgedClosedRepairReconciliation
      );

    expect(forgedClosedRepairValidation.ok).toBe(false);
    expect(forgedClosedRepairValidation.issues.map((issue) => issue.code)).toContain(
      "source_reconciliation_contract_mismatch"
    );
    expect(() =>
      buildProviderExecutionFollowUpN15(
        repairTrio.plan,
        forgedClosedRepairReconciliation
      )
    ).toThrow(/source_reconciliation_contract_mismatch/);
  });


  it("rejects forged latest source receipt schema in direct final closure routing source contract", () => {
    const activeFollowUpItem = {
      item_key:
        "content-pipeline:manual_triage_queue:math_g8_linear_function_intro:provider-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up:content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z",
      human_queue: "manual_triage_queue",
      should_remain_open: true,
    } as const;
    const sourcePlan = {
      schema_version:
        "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1",
      request_key:
        "content-pipeline:provider-execution-request:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      chain_key:
        "content-pipeline:provider-execution-chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      attempt_key:
        "content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z",
      unit_id: "math_g8_linear_function_intro",
      follow_up_state: "manual_follow_up_item_delivered",
      follow_up_action: "none",
      preserved_result_artifact_handoff: null,
      preserved_active_follow_up_item: activeFollowUpItem,
    } as Parameters<typeof validateFinalClosureRoutingSourceContract>[0];
    const sourceReconciliation = {
      schema_version:
        "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation/v0.1",
      source_follow_up_plan_schema_version: sourcePlan.schema_version,
      source_follow_up_receipt_schema_version:
        "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1",
      request_key: sourcePlan.request_key,
      chain_key: sourcePlan.chain_key,
      attempt_key: sourcePlan.attempt_key,
      unit_id: sourcePlan.unit_id,
      follow_up_state: sourcePlan.follow_up_state,
      follow_up_action: sourcePlan.follow_up_action,
      receipt_validation_ok: true,
      receipt_validation_issue_codes: [],
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      delivery_status: "applied",
      result_artifact_handoff: null,
      preserved_active_follow_up_item: activeFollowUpItem,
      final_follow_up_item_key: activeFollowUpItem.item_key,
      final_follow_up_queue: activeFollowUpItem.human_queue,
      unresolved_operations: [],
    } as Parameters<typeof validateFinalClosureRoutingSourceContract>[1];
    const forgedSourceReconciliation = {
      ...sourceReconciliation,
      source_follow_up_receipt_schema_version:
        "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt-forged/v0.1",
    } as unknown as Parameters<typeof validateFinalClosureRoutingSourceContract>[1];

    expect(
      validateFinalClosureRoutingSourceContract(sourcePlan, sourceReconciliation).ok
    ).toBe(true);
    const validation = validateFinalClosureRoutingSourceContract(
      sourcePlan,
      forgedSourceReconciliation
    );

    expect(validation.ok).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain(
      "source_reconciliation_contract_mismatch"
    );
    expect(() =>
      buildFinalClosureRouting(sourcePlan, forgedSourceReconciliation)
    ).toThrow(/source_reconciliation_contract_mismatch/);
  });

  it("returns structured N15 validate issues when source chains are malformed", async () => {
    const tempDir = await mkdtemp(
      join(tmpdir(), "provider-execution-follow-up-n15-malformed-source-")
    );
    const { stdout, stderr, io } = createMemoryIo();
    const n15FollowUp = `provider-execution-follow-up${"-delivery-follow-up".repeat(15)}`;
    const malformedPaths: string[] = [];

    try {
      for (let index = 0; index < 69; index += 1) {
        const path = join(tempDir, `malformed-${index}.json`);
        await writeFile(path, "{}\n", "utf8");
        malformedPaths.push(path);
      }

      const planExitCode = await runContentPipelineCli(
        [
          `validate-review-${n15FollowUp}-plan`,
          ...malformedPaths.slice(0, 66),
          malformedPaths[66]!,
        ],
        io
      );
      const planSummary = JSON.parse(stdout[0] ?? "{}") as {
        ok: boolean;
        issues: Array<{ stage: string }>;
      };

      expect(planExitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(planSummary.ok).toBe(false);
      expect(
        planSummary.issues.some((issue) =>
          issue.stage.endsWith("_plan_source_contract")
        )
      ).toBe(true);

      stdout.length = 0;
      stderr.length = 0;
      const receiptExitCode = await runContentPipelineCli(
        [
          `validate-review-${n15FollowUp}-receipt`,
          ...malformedPaths.slice(0, 67),
          malformedPaths[67]!,
        ],
        io
      );
      const receiptSummary = JSON.parse(stdout[0] ?? "{}") as {
        ok: boolean;
        issues: Array<{ stage: string }>;
      };

      expect(receiptExitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(receiptSummary.ok).toBe(false);
      expect(
        receiptSummary.issues.some((issue) =>
          issue.stage.endsWith("_receipt_source_contract")
        )
      ).toBe(true);

      stdout.length = 0;
      stderr.length = 0;
      const reconciliationExitCode = await runContentPipelineCli(
        [
          `validate-review-${n15FollowUp}-reconciliation`,
          ...malformedPaths.slice(0, 68),
          malformedPaths[68]!,
        ],
        io
      );
      const reconciliationSummary = JSON.parse(stdout[0] ?? "{}") as {
        ok: boolean;
        issues: Array<{ stage: string }>;
      };

      expect(reconciliationExitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(reconciliationSummary.ok).toBe(false);
      expect(
        reconciliationSummary.issues.some((issue) =>
          issue.stage.endsWith("_reconciliation_source_contract")
        )
      ).toBe(true);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("returns structured N16 validate issues when source chains are malformed", async () => {
    const tempDir = await mkdtemp(
      join(tmpdir(), "provider-execution-follow-up-n16-malformed-source-")
    );
    const { stdout, stderr, io } = createMemoryIo();
    const n16FollowUp = `provider-execution-follow-up${"-delivery-follow-up".repeat(16)}`;
    const n17FollowUp = `provider-execution-follow-up${"-delivery-follow-up".repeat(17)}`;
    const malformedPaths: string[] = [];
    const malformedObjects = Array.from({ length: 69 }, () => ({}));
    const malformedN17Objects = Array.from({ length: 73 }, () => ({}));

    try {
      for (let index = 0; index < 77; index += 1) {
        const path = join(tempDir, `malformed-${index}.json`);
        await writeFile(path, index === 0 ? "null\n" : "{}\n", "utf8");
        malformedPaths.push(path);
      }

      const directSourceValidation = validateProviderExecutionFollowUpN16Source(
        ...(malformedObjects as Parameters<typeof validateProviderExecutionFollowUpN16Source>)
      );
      expect(directSourceValidation.ok).toBe(false);
      expect(directSourceValidation.issues.map((issue) => issue.code)).toEqual(
        expect.arrayContaining([
          "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_plan_contract_mismatch",
          "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_reconciliation_contract_mismatch",
        ])
      );
      expect(JSON.stringify(directSourceValidation)).not.toContain("Cannot read properties");
      expect(JSON.stringify(directSourceValidation)).not.toContain("TypeError");

      const exitCode = await runContentPipelineCli(
        [
          `validate-review-${n16FollowUp}`,
          ...malformedPaths.slice(0, 69),
          malformedPaths[69]!,
        ],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}") as {
        ok: boolean;
        issues: Array<{ stage: string }>;
      };

      expect(exitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(summary.ok).toBe(false);
      expect(
        summary.issues.some((issue) => issue.stage.endsWith("_source_contract"))
      ).toBe(true);
      expect(JSON.stringify(summary)).not.toContain("Cannot read properties");
      expect(JSON.stringify(summary)).not.toContain("TypeError");

      stdout.length = 0;
      stderr.length = 0;
      const renderExitCode = await runContentPipelineCli(
        [
          `render-review-${n16FollowUp}`,
          ...malformedPaths.slice(0, 69),
          "--out",
          join(tempDir, "should-not-render.json"),
        ],
        io
      );
      const renderStderr = stderr.join("\n");
      expect(renderExitCode).toBe(1);
      expect(stdout).toEqual([]);
      expect(renderStderr).toContain("Cannot render N16");
      expect(renderStderr).not.toContain("Cannot read properties");
      expect(renderStderr).not.toContain("TypeError");

      for (const suffix of ["plan", "receipt", "reconciliation"] as const) {
        stdout.length = 0;
        stderr.length = 0;
        const sourcePathCount = suffix === "plan" ? 70 : suffix === "receipt" ? 71 : 72;
        const exitCode = await runContentPipelineCli(
          [
            `render-review-${n16FollowUp}-${suffix}`,
            ...malformedPaths.slice(0, sourcePathCount),
            "--out",
            join(tempDir, `should-not-render-${suffix}.json`),
          ],
          io
        );
        const renderTrioStderr = stderr.join("\n");

        expect(exitCode).toBe(1);
        expect(stdout).toEqual([]);
        expect(renderTrioStderr).toContain("Cannot render newest N16");
        expect(renderTrioStderr).not.toContain("Cannot read properties");
        expect(renderTrioStderr).not.toContain("TypeError");
      }

      const directN17SourceValidation = validateProviderExecutionFollowUpN17Source(
        ...(malformedN17Objects as Parameters<typeof validateProviderExecutionFollowUpN17Source>)
      );
      expect(directN17SourceValidation.ok).toBe(false);
      expect(directN17SourceValidation.issues.map((issue) => issue.code)).toEqual(
        expect.arrayContaining([
          "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_plan_contract_mismatch",
          "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_reconciliation_contract_mismatch",
        ])
      );
      expect(JSON.stringify(directN17SourceValidation)).not.toContain("Cannot read properties");
      expect(JSON.stringify(directN17SourceValidation)).not.toContain("TypeError");

      stdout.length = 0;
      stderr.length = 0;
      const n17ValidateExitCode = await runContentPipelineCli(
        [
          `validate-review-${n17FollowUp}`,
          ...malformedPaths.slice(0, 73),
          malformedPaths[73]!,
        ],
        io
      );
      const n17Summary = JSON.parse(stdout[0] ?? "{}") as {
        ok: boolean;
        issues: Array<{ stage: string }>;
      };

      expect(n17ValidateExitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(n17Summary.ok).toBe(false);
      expect(
        n17Summary.issues.some((issue) => issue.stage.endsWith("_source_contract"))
      ).toBe(true);
      expect(JSON.stringify(n17Summary)).not.toContain("Cannot read properties");
      expect(JSON.stringify(n17Summary)).not.toContain("TypeError");

      stdout.length = 0;
      stderr.length = 0;
      const n17RenderExitCode = await runContentPipelineCli(
        [
          `render-review-${n17FollowUp}`,
          ...malformedPaths.slice(0, 73),
          "--out",
          join(tempDir, "should-not-render-n17.json"),
        ],
        io
      );
      const n17RenderStderr = stderr.join("\n");

      expect(n17RenderExitCode).toBe(1);
      expect(stdout).toEqual([]);
      expect(n17RenderStderr).toContain("Cannot render N17");
      expect(n17RenderStderr).not.toContain("Cannot read properties");
      expect(n17RenderStderr).not.toContain("TypeError");

      for (const suffix of ["plan", "receipt", "reconciliation"] as const) {
        stdout.length = 0;
        stderr.length = 0;
        const sourcePathCount = suffix === "plan" ? 74 : suffix === "receipt" ? 75 : 76;
        const exitCode = await runContentPipelineCli(
          [
            `render-review-${n17FollowUp}-${suffix}`,
            ...malformedPaths.slice(0, sourcePathCount),
            "--out",
            join(tempDir, `should-not-render-n17-${suffix}.json`),
          ],
          io
        );
        const renderTrioStderr = stderr.join("\n");

        expect(exitCode).toBe(1);
        expect(stdout).toEqual([]);
        expect(renderTrioStderr).toContain("Cannot render newest N17");
        expect(renderTrioStderr).not.toContain("Cannot read properties");
        expect(renderTrioStderr).not.toContain("TypeError");
      }
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});







