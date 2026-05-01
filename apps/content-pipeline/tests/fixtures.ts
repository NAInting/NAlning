import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { UnitReviewArtifact } from "../src";

export const unknownNodeReviewArtifactFixturePath = resolve(
  process.cwd(),
  "tests/fixtures/unknown-node-review-artifact.json"
);

export function loadUnknownNodeReviewArtifact(): UnitReviewArtifact {
  return JSON.parse(readFileSync(unknownNodeReviewArtifactFixturePath, "utf8")) as UnitReviewArtifact;
}
