import { demoIds, studentMasteryByToken, studentProfileByToken } from "@/mocks/data/demo-data";
import type {
  StudentAgentSessionResponse,
  StudentMasteryResponse,
  StudentProfileResponse
} from "@/types/demo";

export async function getStudentMastery(
  studentToken: string
): Promise<StudentMasteryResponse | undefined> {
  await Promise.resolve();
  if (!studentToken) {
    return undefined;
  }
  const match = studentMasteryByToken[studentToken as keyof typeof studentMasteryByToken];
  return match ?? undefined;
}

export async function createStudentAgentSession(
  message: string
): Promise<StudentAgentSessionResponse> {
  await Promise.resolve();

  const sensitiveKeywords = ["难受", "崩溃", "哭", "焦虑", "家里", "不想学", "撑不住"];
  const routeSelected = sensitiveKeywords.some((token) => message.includes(token))
    ? "campus_local"
    : "controlled_cloud";

  return {
    session_id: demoIds.sessionMain,
    route_selected: routeSelected,
    assistant_message:
      routeSelected === "campus_local"
        ? "这段会话会留在校内处理。我先不追问隐私内容，只想确认你现在更需要休息、联系老师，还是把任务拆成最小下一步？"
        : "可以，我们先不直接给答案。你先说说顶点式里，哪一部分对应图像的平移？",
    follow_up_suggestions:
      routeSelected === "campus_local"
        ? ["我想先暂停一下", "我想联系老师", "我只想做最小下一步"]
        : ["先画一条最简单的抛物线", "先说说 a、h、k 各自代表什么"],
    request_id: "req_01K101"
  };
}

export async function getStudentProfile(
  studentToken: string
): Promise<StudentProfileResponse | undefined> {
  await Promise.resolve();
  if (!studentToken) {
    return undefined;
  }
  const match = studentProfileByToken[studentToken as keyof typeof studentProfileByToken];
  return match ?? undefined;
}
