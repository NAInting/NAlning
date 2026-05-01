import { createHash } from "node:crypto";

import type { EmbeddingProvider } from "./types";

export class DeterministicEmbeddingProvider implements EmbeddingProvider {
  readonly dimension: number;

  constructor(dimension = 1536) {
    this.dimension = dimension;
  }

  embed(text: string): readonly number[] {
    const values = Array.from({ length: this.dimension }, (_, index) => {
      const digest = createHash("sha256").update(`${index}:${text}`).digest();
      return (digest.readUInt16BE(0) / 65535) * 2 - 1;
    });
    const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));

    return values.map((value) => value / (norm || 1));
  }
}
