import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Box } from "@mui/material";
import styled from "@emotion/styled";
import { fetchScheduleTasks } from "../../../../api/schedule"; // ✅ 간트 차트 API 사용
import ScheduleDetailModal from "../../components/ScheduleDetailModal";
import { useSelector } from "react-redux";

const CalendarWrapper = styled(Box)({
  padding: "20px",
  "& .calendar-container": {
    padding: "20px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
});

const Calendar = () => {
  const activeWorkspace = useSelector((state) => state.workspace.activeWorkspace);
  const wsId = activeWorkspace?.wsId;

  const [events, setEvents] = useState([]); // ✅ 캘린더에서 사용할 일정 데이터
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  useEffect(() => {
    if (!wsId) return;
    
    const loadEvents = async () => {
      try {
        const tasks = await fetchScheduleTasks(wsId); // ✅ 간트 차트 API로 데이터 가져오기
        setEvents(tasks); // ✅ 캘린더의 events 상태에 저장
        console.log("📅 캘린더에 로드된 데이터:", tasks);
      } catch (error) {
        console.error("❌ 캘린더 데이터 로드 실패:", error);
      }
    };

    loadEvents();
  }, [wsId]);

  // ✅ 이벤트 클릭 시 모달 열기 (기존 기능 유지)
  const handleEventClick = (clickInfo) => {
    console.log("📌 클릭한 이벤트:", clickInfo.event.extendedProps);
    setSelectedSchedule(clickInfo.event.extendedProps);
    setModalOpen(true);
  };

  return (
    <CalendarWrapper>
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events} // ✅ 간트 차트 API에서 불러온 데이터를 사용
          headerToolbar={{
            left: "",
            center: "title",
            right: "prev,today,next",
          }}
          locale="ko"
          height="auto"
          fixedWeekCount={false}
          showNonCurrentDates={false}
          eventClick={handleEventClick} // ✅ 클릭한 일정의 데이터 가져오기
        />
        
        {/* ✅ 모달 기능 유지, selectedSchedule 초기화 X */}
        <ScheduleDetailModal
          open={modalOpen}
          onClose={() => {
            console.log("📌 모달 닫기 실행됨 - Calendar.jsx");
            setModalOpen(false); // ✅ 모달만 닫고 기존 데이터 유지
          }}
          schedule={selectedSchedule}
        />
      </div>
    </CalendarWrapper>
  );
};

export default Calendar;
