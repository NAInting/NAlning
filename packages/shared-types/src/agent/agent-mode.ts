import { z } from "zod";

import { AgentMode } from "../enums";

/**
 * Agent 模式运行时 schema。
 */
export const AgentModeSchema = z.nativeEnum(AgentMode);

/**
 * Agent 模式值类型。
 */
export type AgentModeValue = z.infer<typeof AgentModeSchema>;
