import { randomUUID } from "node:crypto";

import {
  AgentRuntimeEventSchema,
  AgentType,
  PrivacyLevel,
  UserRole,
  projectAgentRuntimeEvent,
  type AgentRuntimeEventDomain,
  type AgentRuntimeEventPayload,
  type AgentRuntimeEventProjection,
  type AgentRuntimeEventProjectionView,
  type AgentRuntimeEventType,
  type ParsedAgentRuntimeEvent,
  type VisibilityScope,
  type AgentRuntimeInternalMetadata
} from "@edu-ai/shared-types";

export interface AgentRuntimeEventEmitterOptions {
  source_agent_id: string;
  source_agent_type: AgentType;
  trace_id?: string;
  run_id?: string;
  default_privacy_level?: PrivacyLevel;
  default_visibility_scope?: VisibilityScope;
  now?: () => Date;
  id_generator?: () => string;
}

export interface EmitAgentRuntimeEventInput {
  event_type: AgentRuntimeEventType;
  domain: AgentRuntimeEventDomain;
  payload: AgentRuntimeEventPayload;
  privacy_level?: PrivacyLevel;
  visibility_scope?: VisibilityScope;
  session_id?: string;
  student_id?: string;
  unit_id?: string;
  stage_id?: string;
  internal_metadata?: AgentRuntimeInternalMetadata;
}

export class InMemoryAgentRuntimeEventEmitter {
  private readonly sourceAgentId: string;
  private readonly sourceAgentType: AgentType;
  private readonly traceId: string;
  private readonly runId: string;
  private readonly defaultPrivacyLevel: PrivacyLevel;
  private readonly defaultVisibilityScope: VisibilityScope;
  private readonly now: () => Date;
  private readonly idGenerator: () => string;
  private readonly events: ParsedAgentRuntimeEvent[] = [];
  private nextSequence = 0;

  constructor(options: AgentRuntimeEventEmitterOptions) {
    this.sourceAgentId = options.source_agent_id;
    this.sourceAgentType = options.source_agent_type;
    this.runId = options.run_id ?? `run_${randomUUID()}`;
    this.traceId = options.trace_id ?? `trace_${this.runId}`;
    this.defaultPrivacyLevel = options.default_privacy_level ?? PrivacyLevel.PUBLIC;
    this.defaultVisibilityScope = options.default_visibility_scope ?? {
      visible_to_roles: [UserRole.ADMIN]
    };
    this.now = options.now ?? (() => new Date());
    this.idGenerator = options.id_generator ?? randomUUID;
  }

  emit(input: EmitAgentRuntimeEventInput): ParsedAgentRuntimeEvent {
    const timestamp = this.now().toISOString();
    const event = AgentRuntimeEventSchema.parse({
      id: this.idGenerator(),
      created_at: timestamp,
      updated_at: timestamp,
      version: 1,
      trace_id: this.traceId,
      run_id: this.runId,
      sequence: this.nextSequence,
      event_type: input.event_type,
      domain: input.domain,
      source_agent_id: this.sourceAgentId,
      source_agent_type: this.sourceAgentType,
      session_id: input.session_id,
      student_id: input.student_id,
      unit_id: input.unit_id,
      stage_id: input.stage_id,
      privacy_level: input.privacy_level ?? this.defaultPrivacyLevel,
      visibility_scope: input.visibility_scope ?? this.defaultVisibilityScope,
      occurred_at: timestamp,
      payload: input.payload,
      internal_metadata: input.internal_metadata
    });

    this.events.push(event);
    this.nextSequence += 1;

    return event;
  }

  list(): readonly ParsedAgentRuntimeEvent[] {
    return this.events;
  }

  project(view: AgentRuntimeEventProjectionView): readonly AgentRuntimeEventProjection[] {
    return this.events
      .map((event) => projectAgentRuntimeEvent(event, view))
      .filter((event): event is AgentRuntimeEventProjection => event !== null);
  }
}

export function createInMemoryAgentRuntimeEventEmitter(
  options: AgentRuntimeEventEmitterOptions
): InMemoryAgentRuntimeEventEmitter {
  return new InMemoryAgentRuntimeEventEmitter(options);
}
