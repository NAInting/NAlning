import {
  AgentType,
  PrivacyLevel,
  UserRole,
  type AgentRuntimeEventProjection,
  type ParsedAgentRuntimeEvent
} from "@edu-ai/shared-types";

import {
  createInMemoryAgentRuntimeEventEmitter,
  type AgentRuntimeEventEmitterOptions,
  type EmitAgentRuntimeEventInput,
  type InMemoryAgentRuntimeEventEmitter
} from "../runtime-events";

export interface MockStudentAgentRuntimeRunInput {
  source_agent_id: string;
  trace_id?: string;
  run_id?: string;
  session_id?: string;
  student_id?: string;
  unit_id: string;
  stage_id?: string;
  topic_label?: string;
  knowledge_node_id: string;
  runtime_block_id: string;
  source_reference?: string;
  now?: () => Date;
  id_generator?: () => string;
}

export interface MockStudentAgentRuntimeRunResult {
  emitter: InMemoryAgentRuntimeEventEmitter;
  events: readonly ParsedAgentRuntimeEvent[];
  student_projection: readonly AgentRuntimeEventProjection[];
  teacher_projection: readonly AgentRuntimeEventProjection[];
  guardian_projection: readonly AgentRuntimeEventProjection[];
  admin_audit_projection: readonly AgentRuntimeEventProjection[];
}

const STUDENT_RUNTIME_VISIBILITY = {
  visible_to_roles: [UserRole.STUDENT, UserRole.SYSTEM]
};

export function runMockStudentAgentRuntime(
  input: MockStudentAgentRuntimeRunInput
): MockStudentAgentRuntimeRunResult {
  const emitterOptions: AgentRuntimeEventEmitterOptions = {
    source_agent_id: input.source_agent_id,
    source_agent_type: AgentType.STUDENT_AGENT,
    default_privacy_level: PrivacyLevel.STUDENT_PRIVATE,
    default_visibility_scope: STUDENT_RUNTIME_VISIBILITY
  };

  if (input.trace_id) {
    emitterOptions.trace_id = input.trace_id;
  }

  if (input.run_id) {
    emitterOptions.run_id = input.run_id;
  }

  if (input.now) {
    emitterOptions.now = input.now;
  }

  if (input.id_generator) {
    emitterOptions.id_generator = input.id_generator;
  }

  const emitter = createInMemoryAgentRuntimeEventEmitter(emitterOptions);

  const topic = input.topic_label ?? input.knowledge_node_id;
  const commonContext = buildCommonContext(input);

  emitStudentRuntimeEvent(emitter, commonContext, {
    event_type: "stage_start",
    domain: "academic",
    payload: {
      title: "Start guided learning step",
      summary: `Learning focus: ${topic}.`
    },
    internal_metadata: {
      prompt_id: "mock_student_agent_runtime",
      prompt_version: "v0",
      provider_id: "local_mock"
    }
  });

  emitStudentRuntimeEvent(emitter, commonContext, {
    event_type: "progress",
    domain: "academic",
    payload: {
      progress: {
        current: 1,
        total: 3,
        label: "Compare the concept anchor with the current activity block"
      }
    }
  });

  emitStudentRuntimeEvent(emitter, commonContext, {
    event_type: "source_anchor",
    domain: "content",
    payload: {
      source_anchor: {
        source_id: input.knowledge_node_id,
        source_type: "knowledge_node",
        reference: input.source_reference ?? input.knowledge_node_id
      }
    }
  });

  emitStudentRuntimeEvent(emitter, commonContext, {
    event_type: "result",
    domain: "academic",
    payload: {
      result: {
        result_code: "mock_student_agent_guidance_ready",
        summary: "The next step is ready for a no-AI explanation check."
      }
    }
  });

  emitStudentRuntimeEvent(emitter, commonContext, {
    event_type: "done",
    domain: "runtime",
    payload: {
      title: "Mock student agent run completed",
      summary: "Student-facing runtime trace completed with structured events only."
    }
  });

  return {
    emitter,
    events: emitter.list(),
    student_projection: emitter.project("student"),
    teacher_projection: emitter.project("teacher"),
    guardian_projection: emitter.project("guardian"),
    admin_audit_projection: emitter.project("admin_audit")
  };
}

function buildCommonContext(input: MockStudentAgentRuntimeRunInput): Partial<EmitAgentRuntimeEventInput> {
  const context: Partial<EmitAgentRuntimeEventInput> = {
    unit_id: input.unit_id
  };

  if (input.session_id) {
    context.session_id = input.session_id;
  }

  if (input.student_id) {
    context.student_id = input.student_id;
  }

  if (input.stage_id) {
    context.stage_id = input.stage_id;
  }

  return context;
}

function emitStudentRuntimeEvent(
  emitter: InMemoryAgentRuntimeEventEmitter,
  commonContext: Partial<EmitAgentRuntimeEventInput>,
  event: EmitAgentRuntimeEventInput
): ParsedAgentRuntimeEvent {
  return emitter.emit({
    ...commonContext,
    ...event
  });
}
