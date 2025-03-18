import axios from "axios";
import { api } from "./auth"; // ✅ 기존 API 인스턴스 사용

const getAxiosConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

// ✅ 상태 코드 매핑 (프론트 → 백엔드)
const statusMapping = {
  unassigned: '1',
  inProgress: '2',
  completed: '3',
  backlog: '4'
};

// ✅ 상태 코드 역매핑 (백엔드 ENUM → 프론트)
const statusMappingReverse = {
  "UNASSIGNED": "unassigned",
  "IN_PROGRESS": "inProgress",
  "COMPLETED": "completed",
  "ON_HOLD": "backlog"  // "보류" 상태
};

// ✅ [공통] 칸반 보드 목록 조회
export const fetchKanbanTasks = async (wsId) => {
  if (!wsId) {
    console.warn("🚨 fetchKanbanTasks: wsId가 없어서 요청을 중단합니다.");
    return [];
  }

  try {
    console.log(`📌 fetchKanbanTasks(${wsId}) API 요청 시작...`);

    // ✅ 캐시 문제 해결: 항상 새로운 요청으로 인식되게 변경
    const response = await api.get("/schedule", {
      params: { wsId, t: Date.now() }, // ⬅️ 여기서 캐시 우회
      ...getAxiosConfig(),
    });

    console.log("📌 API 응답 데이터:", response.data);  // 👈 백엔드 응답 확인

    if (!response.data || !response.data.data) {
      console.error("❌ 올바르지 않은 데이터 구조:", response.data);
      return [];
    }

    return response.data.data.map((task) => {
      console.log(`📌 변환 전 상태: ${task.scheduleStatus}`); // 👈 상태값 확인

      const statusKey = task.scheduleStatus?.toUpperCase(); // ✅ 대문자로 변환 후 매핑
      const mappedStatus = statusMappingReverse[statusKey] || "unassigned"; // ✅ 변환 후 상태 확인

      // ✅ 상태 변환 검토 추가
      console.log(`
    🔄 상태 변환 과정 확인:
    - 원본 상태: ${task.scheduleStatus}
    - 변환된 상태: ${statusKey}
    - 최종 매핑 결과: ${mappedStatus}
      `);

      return {
        id: task.scheduleNumber,
        title: task.scheduleTitle || "제목 없음",
        start: task.scheduleStartDate ? new Date(task.scheduleStartDate) : null,
        end: task.scheduleFinishDate ? new Date(task.scheduleFinishDate) : null,
        status: mappedStatus, // ✅ ENUM 변환 적용
        extendedProps: task,
      };
    });
  } catch (error) {
    console.error("❌ fetchKanbanTasks API 요청 실패:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ [공통] 스케줄 목록 조회 (캘린더, 간트차트용)
export const fetchScheduleTasks = async (wsId) => {
  if (!wsId) {
    console.warn("🚨 fetchScheduleTasks: wsId가 없어서 요청을 중단합니다.");
    return [];
  }

  try {
    console.log(`📌 fetchScheduleTasks(${wsId}) API 요청 시작...`);

    const response = await api.get("/schedule", {
      params: { wsId },
      ...getAxiosConfig(),
    });

    console.log("📌 API 응답 데이터:", response.data);

    if (!response.data || !response.data.data) {
      console.error("❌ 올바르지 않은 데이터 구조:", response.data);
      return [];
    }

    return response.data.data.map((task) => ({
      id: task.scheduleNumber,
      title: task.scheduleTitle || "제목 없음",
      start: task.scheduleStartDate ? new Date(task.scheduleStartDate) : null,
      end: task.scheduleFinishDate ? new Date(task.scheduleFinishDate) : null,
      status: task.scheduleStatus || "unassigned", // ✅ 숫자 → 텍스트 변환
      extendedProps: task,
    }));
  } catch (error) {
    console.error("❌ fetchScheduleTasks API 요청 실패:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ [공통] 단일 스케줄 조회
export const getSchedule = async (scheduleNumber) => {
  const response = await api.get(`/schedule/${scheduleNumber}`, getAxiosConfig());
  return response.data;
};

// ✅ [공통] 스케줄 생성
export const createSchedule = async (scheduleData) => {
  const response = await api.post(`/schedule`, scheduleData, getAxiosConfig());
  return response.data;
};

// ✅ [공통] 스케줄 수정 (PUT 요청)
export const updateSchedule = async (scheduleId, updatedData) => {
  if (!scheduleId || !updatedData) {
    console.warn("🚨 updateSchedule: 잘못된 입력 값 (scheduleId, updatedData)");
    return;
  }

  try {
    console.log(`📌 updateSchedule(${scheduleId}) 요청 데이터:`, updatedData);

    await api.put(`/schedule/${scheduleId}`, updatedData, getAxiosConfig());

    console.log(`✅ ${scheduleId} 스케줄 수정 완료`);
  } catch (error) {
    console.error(`❌ ${scheduleId} 스케줄 수정 실패:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ [공통] 스케줄 삭제
export const deleteSchedule = async (scheduleNumber) => {
  const response = await api.delete(`/schedule/${scheduleNumber}`, getAxiosConfig());
  return response.data;
};

// ✅ [공통] 칸반에서 스케줄 담당자 지정 (추가)
export const assignSchedule = async (scheduleNumber) => {
  if (!scheduleNumber) {
    console.warn("🚨 assignSchedule: 잘못된 입력 값 (scheduleNumber)");
    return;
  }

  try {
    console.log(`📌 assignSchedule(${scheduleNumber}) 요청`);

    await api.put(`/schedule/${scheduleNumber}/assignees/kanban`, {}, getAxiosConfig());

    console.log(`✅ ${scheduleNumber} 스케줄 담당자 지정 완료`);
  } catch (error) {
    console.error(`❌ ${scheduleNumber} 스케줄 담당자 지정 실패:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ [공통] 칸반 보드 상태 변경
export const updateKanbanTaskStatus = async (taskId, newStatus) => {
  if (!taskId || !newStatus) {
    console.warn("🚨 updateKanbanTaskStatus: 잘못된 입력 값 (taskId, newStatus)");
    return;
  }

  const statusCode = statusMapping[newStatus]; // ✅ 변환된 값 사용
  if (!statusCode) {
    console.error(`❌ updateKanbanTaskStatus: 잘못된 상태 값 (${newStatus})`);
    return;
  }

  try {
    console.log(`📌 updateKanbanTaskStatus(${taskId}) → ${statusCode} 요청`);

    // ✅ params 옵션을 사용하여 상태 값을 전송 (쿼리 파라미터 방식 수정)
    await api.put(`/schedule/${taskId}/status`, null, {
      params: { status: statusCode },
      ...getAxiosConfig(),
    });

    console.log(`✅ ${taskId} 상태 변경 완료 (${newStatus})`);
  } catch (error) {
    console.error(`❌ ${taskId} 상태 변경 실패 (${newStatus}):`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ 스케줄 상세 모달에서 담당자 변경 API 요청
export const assignScheduleDetail = async (scheduleNumber, email) => {
  console.log("현재 선택 멤버, 이메일 확인", scheduleNumber, email)

  if (!scheduleNumber || !email) {
    console.warn("🚨 assignScheduleDetail: 잘못된 입력 값 (scheduleNumber, email)");
    return;
  }

  try {
    console.log(`📌 assignScheduleDetail(${scheduleNumber}, ${email}) 요청 시작`);

    await api.put(`/schedule/${scheduleNumber}/assignees/detail`, null, {
      params: { email },  // ✅ 쿼리 파라미터로 이메일 전달
      ...getAxiosConfig(),
    });

    console.log(`✅ ${scheduleNumber} 담당자 변경 완료 (${email})`);
  } catch (error) {
    console.error(`❌ ${scheduleNumber} 담당자 변경 실패:`, error.response?.data || error.message);
    throw error;
  }
};



// ✅ 수정된 `fetchKanbanTasks`로 변경
export default {
  fetchKanbanTasks,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  assignSchedule,
  updateKanbanTaskStatus, // ✅ 칸반 보드 상태 업데이트 추가
  assignScheduleDetail,
};
