/* eslint-disable prettier/prettier */
import axios from 'axios';
import { api } from './auth';

/**
 * 내 스케줄 조회 API
 * @returns {Promise<Object>} 내 스케줄 목록 데이터
 */
export const getMySchedule = async () => {
  try {
    const response = await api.get('/mypage/schedule');
    return response.data;
  } catch (error) {
    console.error('내 스케줄 조회 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 내가 속한 모든 워크스페이스의 자료실 데이터 조회 API
 * @returns {Promise<Object>} 워크스페이스 자료실 데이터 목록
 */
export const getMyWorkspaceData = async () => {
  try {
    const response = await api.get('/mypage/workdata');
    return response.data;
  } catch (error) {
    console.error('워크스페이스 자료실 데이터 조회 중 오류 발생:', error);
    throw error;
  }
};

/**
 * 내 스케줄 데이터를 간트차트 형식으로 변환하는 함수
 * @param {Array} scheduleList 내 스케줄 목록
 * @returns {Array} 간트차트 형식으로 변환된 데이터
 */
export const convertToGanttFormat = (scheduleList) => {
  if (!scheduleList || scheduleList.length === 0) {
    return [];
  }

  return scheduleList.map(schedule => ({
    id: schedule.scheduleNumber.toString(),
    name: schedule.scheduleTitle,
    start: new Date(schedule.scheduleStartDate),
    end: new Date(schedule.scheduleFinishDate),
    progress: 0,
    dependencies: [],
    type: "task",
    status: schedule.scheduleStatus,
    wsName: schedule.wsName,
    extendedProps: {
      content: schedule.scheduleContent,
      wsName: schedule.wsName,
      wsId: schedule.wsId,
      status: schedule.scheduleStatus,
      tag1: schedule.tag1,
      tag2: schedule.tag2,
      tag3: schedule.tag3,
      color: schedule.color,
      modifyTime: schedule.scheduleModifytime
    }
  }));
};

/**
 * 내 스케줄 데이터를 FullCalendar 형식으로 변환하는 함수
 * @param {Array} scheduleList 내 스케줄 목록
 * @returns {Array} FullCalendar 형식으로 변환된 데이터
 */
export const convertToCalendarFormat = (scheduleList) => {
  if (!scheduleList || scheduleList.length === 0) {
    return [];
  }

  return scheduleList.map(schedule => {
    // 시작일과 종료일이 같은지 확인
    const startDate = new Date(schedule.scheduleStartDate);
    const endDate = new Date(schedule.scheduleFinishDate);
    const isSameDay = startDate.toDateString() === endDate.toDateString();
    
    // 하루짜리 일정인 경우 종료일을 다음날로 설정 (FullCalendar에서 제대로 표시되도록)
    let adjustedEnd = schedule.scheduleFinishDate;
    if (isSameDay) {
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      adjustedEnd = nextDay.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환
    }
    
    return {
      id: schedule.scheduleNumber.toString(),
      title: schedule.scheduleTitle,
      start: schedule.scheduleStartDate,
      end: adjustedEnd,
      backgroundColor: schedule.color || '#1976d2',
      borderColor: schedule.color || '#1976d2',
      allDay: true, // 모든 일정을 종일 일정으로 표시
      extendedProps: {
        // ScheduleDetailModal에 필요한 속성 이름으로 매핑
        scheduleNumber: schedule.scheduleNumber,
        scheduleTitle: schedule.scheduleTitle,
        scheduleContent: schedule.scheduleContent,
        scheduleStartDate: schedule.scheduleStartDate,
        scheduleFinishDate: schedule.scheduleFinishDate,
        scheduleStatus: schedule.scheduleStatus || 'UNASSIGNED',
        scheduleModifytime: schedule.scheduleModifytime || new Date().toISOString(),
        color: schedule.color,
        
        // 워크스페이스 정보
        wsName: schedule.wsName,
        wsId: schedule.wsId,
        
        // 태그 정보
        tag1: schedule.tag1,
        tag2: schedule.tag2,
        tag3: schedule.tag3,
        
        // 담당자 정보
        nickname: schedule.nickname,
        profileImage: schedule.profileImage,
        
        // 원본 데이터도 유지
        content: schedule.scheduleContent,
        status: schedule.scheduleStatus || 'UNASSIGNED',
        modifyTime: schedule.scheduleModifytime,
        originalEndDate: schedule.scheduleFinishDate // 원래 종료일 저장
      }
    };
  });
};

/**
 * 내가 속한 모든 워크스페이스 목록 조회 API
 * @returns {Promise<Object>} 워크스페이스 목록 데이터
 */
export const getMyWorkspaces = async () => {
  try {
    const response = await api.get('/workspace');
    return response.data;
  } catch (error) {
    console.error('워크스페이스 목록 조회 중 오류 발생:', error);
    throw error;
  }
};