import { z } from "zod";

import { Subject } from "../enums";

/**
 * 学科枚举的运行时 schema。
 */
export const SubjectSchema = z.nativeEnum(Subject);

/**
 * 学科值类型。
 */
export type SubjectValue = z.infer<typeof SubjectSchema>;
