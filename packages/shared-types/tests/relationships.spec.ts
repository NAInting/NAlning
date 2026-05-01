import { describe, expect, it } from "vitest";

import { buildSeedDataset } from "../src/testing/seed-generator";

describe("relationship integrity", () => {
  it("creates a coherent school graph", () => {
    const dataset = buildSeedDataset();

    expect(dataset.classes).toHaveLength(2);
    expect(dataset.students).toHaveLength(20);
    expect(dataset.teachers).toHaveLength(5);
    expect(dataset.guardians).toHaveLength(30);
  });

  it("ensures every student points to a real user and school", () => {
    const dataset = buildSeedDataset();
    const userIds = new Set(dataset.users.map((user) => user.id));

    for (const student of dataset.students) {
      expect(userIds.has(student.user_id)).toBe(true);
      expect(student.school_id).toBe(dataset.school.id);
    }
  });

  it("ensures all bindings reference existing actors", () => {
    const dataset = buildSeedDataset();
    const teacherIds = new Set(dataset.teachers.map((teacher) => teacher.id));
    const guardianIds = new Set(dataset.guardians.map((guardian) => guardian.id));
    const studentIds = new Set(dataset.students.map((student) => student.id));

    for (const binding of dataset.teacher_student_bindings) {
      expect(teacherIds.has(binding.teacher_id)).toBe(true);
      expect(studentIds.has(binding.student_id)).toBe(true);
    }

    for (const binding of dataset.guardian_student_bindings) {
      expect(guardianIds.has(binding.guardian_id)).toBe(true);
      expect(studentIds.has(binding.student_id)).toBe(true);
    }
  });
});
