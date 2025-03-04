import { api } from "./auth"; // 기존 api 인스턴스 사용

// 스케줄 목록 조회
export const fetchScheduleTasks = async (wsId) => {
    try {
        const response = await api.get(`/schedule`, {
            params: { wsId }
        });

        console.log("📌 API 응답 데이터:", response.data);

        // 응답 구조 확인 후 data가 없으면 오류 처리
        if (!response.data || !response.data.data) {
            console.error("올바르지 않은 데이터 구조:", response.data);
            return [];
        }

        // 변환된 간트 차트 데이터 반환
        return response.data.data
            .filter(task => task.scheduleStartDate && task.scheduleFinishDate)
            .map(task => ({
                id: task.scheduleNumber || Math.random().toString(),
                name: task.scheduleTitle || "제목 없음",
                start: new Date(task.scheduleStartDate),
                end: new Date(task.scheduleFinishDate),
                type: "task",
                progress: 0,
                isDisabled: false,
                styles: { backgroundColor: task.color || "#DBE2EF" },
            }));

    } catch (error) {
        console.error("❌ 스케줄 데이터 가져오기 오류:", error.response?.data || error);
        throw error;
    }
};
