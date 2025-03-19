/* eslint-disable prettier/prettier */
import axios from 'axios';
import { api } from './auth';
import defaultWorkspaceIcon from "assets/images/icons/bibimsero.png"; // 기본 워크스페이스 이미지 추가

// 워크스페이스 색상 저장용 맵 (wsId -> color)
const workspaceColorMap = new Map();

// 이미 할당된 색상을 추적하는 세트
const usedColors = new Set();

// 색상 팔레트 정의 - 새 이미지에 맞는 색상 팔레트로 변경
const colorPalette = [
  '#FF5A13', // 주황
  '#FF3C5D', // 빨강
  '#FF98A8', // 연핑크
  '#B28BD4', // 보라
  '#8EAFCA', // 회청색
  '#38B3FB', // 파랑
  '#00A884', // 초록
  '#7ED957', // 라임
  '#77D0C6', // 청록
  '#FFD43B', // 노랑
  '#D6CE57', // 노랑
  '#FF9939'  // 주황
];

/**
 * 랜덤한 색상을 생성하는 함수
 * @returns {string} 랜덤 색상 (16진수 형식)
 */
const generateRandomColor = () => {
  // 밝은 색상 생성
  const r = Math.floor(Math.random() * 156) + 100; // 100-255
  const g = Math.floor(Math.random() * 156) + 100; // 100-255
  const b = Math.floor(Math.random() * 156) + 100; // 100-255
  
  // 16진수 색상 코드로 변환
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * 워크스페이스 ID를 기반으로 고유한 색상을 생성하는 함수
 * @param {number|string} wsId 워크스페이스 ID
 * @returns {string} 해당 워크스페이스의 고유 색상 (16진수 형식)
 */
export const getWorkspaceColor = (wsId) => {
  // wsId가 없으면 기본 색상 반환
  if (!wsId) return '#38B3FB';
  
  const wsIdStr = wsId.toString();
  
  // 이미 할당된 색상이 있으면 반환
  if (workspaceColorMap.has(wsIdStr)) {
    return workspaceColorMap.get(wsIdStr);
  }
  
  // 시작 인덱스 결정 (wsId를 숫자로 변환하고 모듈로 연산)
  let startIndex = typeof wsId === 'number' 
    ? wsId % colorPalette.length
    : parseInt(wsId, 10) % colorPalette.length;
  
  // 사용하지 않은 색상 찾기
  let color = null;
  let checked = 0;
  
  // 모든 색상 팔레트를 순회하면서 사용하지 않은 색상 찾기
  while (checked < colorPalette.length) {
    const candidateColor = colorPalette[(startIndex + checked) % colorPalette.length];
    if (!usedColors.has(candidateColor)) {
      color = candidateColor;
      break;
    }
    checked++;
  }
  
  // 모든 색상이 이미 사용 중이면 랜덤 색상 생성
  if (!color) {
    color = generateRandomColor();
    
    // 이미 사용 중인 랜덤 색상과 너무 비슷하지 않은지 확인
    let attempts = 0;
    while (attempts < 10) {
      // 이미 같은 색상이 있는지 확인 (완전히 동일한 색상만 검사)
      if (!usedColors.has(color)) {
        break;
      }
      color = generateRandomColor();
      attempts++;
    }
  }
  
  // 색상 맵에 저장하고 사용된 색상 목록에 추가
  workspaceColorMap.set(wsIdStr, color);
  usedColors.add(color);
  
  return color;
};

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
 * 이미지 URL이 유효한지 확인하는 헬퍼 함수
 * @param {string} imageUrl 검증할 이미지 URL
 * @returns {string} 유효한 URL 또는 기본 이미지 URL
 */
export const getValidImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined' || imageUrl === '') {
    return defaultWorkspaceIcon;
  }
  
  // URL이 http:// 또는 https://로 시작하는지 확인
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('/')) {
    return defaultWorkspaceIcon;
  }
  
  return imageUrl;
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

  return scheduleList.map(schedule => {
    // 워크스페이스 ID를 기반으로 색상 생성
    const wsColor = getWorkspaceColor(schedule.wsId);
    
    // 워크스페이스 이미지 URL 검증
    const wsImg = getValidImageUrl(schedule.wsImg);
    
    // 시작일과 종료일이 같은지 확인 (하루짜리 일정)
    const startDate = new Date(schedule.scheduleStartDate);
    const endDate = new Date(schedule.scheduleFinishDate);
    const isSameDay = startDate.toDateString() === endDate.toDateString();
    
    // 하루짜리 일정인 경우 간트차트에서 보이도록 종료일을 다음날로 조정
    let adjustedEnd = endDate;
    if (isSameDay) {
      adjustedEnd = new Date(endDate);
      adjustedEnd.setDate(adjustedEnd.getDate() + 1);
    }
    
    return {
      id: schedule.scheduleNumber.toString(),
      name: schedule.scheduleTitle,
      start: new Date(schedule.scheduleStartDate),
      end: adjustedEnd, // 조정된 종료일 사용
      progress: 0,
      dependencies: [],
      type: "task",
      status: schedule.scheduleStatus,
      wsName: schedule.wsName,
      wsId: schedule.wsId,
      wsImg: wsImg, // 검증된 워크스페이스 이미지
      // 워크스페이스 색상 적용
      styles: { 
        backgroundColor: wsColor,
        backgroundSelectedColor: wsColor,
        progressColor: wsColor,
      },
      extendedProps: {
        content: schedule.scheduleContent,
        wsName: schedule.wsName,
        wsId: schedule.wsId,
        wsImg: wsImg, // 검증된 워크스페이스 이미지
        status: schedule.scheduleStatus,
        tag1: schedule.tag1,
        tag2: schedule.tag2,
        tag3: schedule.tag3,
        color: wsColor, // 태그 색상 대신 워크스페이스 색상 사용
        modifyTime: schedule.scheduleModifytime,
        originalEndDate: schedule.scheduleFinishDate // 원래 종료일 저장
      }
    };
  });
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
    
    // 워크스페이스 ID를 기반으로 색상 생성
    const wsColor = getWorkspaceColor(schedule.wsId);
    
    // 워크스페이스 이미지 URL 검증
    const wsImg = getValidImageUrl(schedule.wsImg);
    
    return {
      id: schedule.scheduleNumber.toString(),
      title: schedule.scheduleTitle,
      start: schedule.scheduleStartDate,
      end: adjustedEnd,
      backgroundColor: wsColor, // 태그 색상 대신 워크스페이스 색상 사용
      borderColor: wsColor, // 태그 색상 대신 워크스페이스 색상 사용
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
        color: wsColor, // 태그 색상 대신 워크스페이스 색상 사용
        
        // 워크스페이스 정보
        wsName: schedule.wsName,
        wsId: schedule.wsId,
        wsImg: wsImg, // 검증된 워크스페이스 이미지
        
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
    
    // API 응답 형식 확인
    console.log('워크스페이스 API 응답:', response);
    
    if (!response.data) {
      console.warn('워크스페이스 API 응답에 data가 없습니다:', response);
      return [];
    }
    
    // 데이터가 배열이 아닌 경우 확인
    const workspaceList = Array.isArray(response.data) ? response.data : 
                         (response.data.data && Array.isArray(response.data.data)) ? response.data.data : [];
    
    // 각 워크스페이스 데이터 검증 및 보완
    const enrichedWorkspaceList = workspaceList.map(workspace => ({
      ...workspace,
      wsImg: getValidImageUrl(workspace.wsImg)
    }));
    
    console.log('보강된 워크스페이스 데이터:', enrichedWorkspaceList);
    return enrichedWorkspaceList;
  } catch (error) {
    console.error('워크스페이스 목록 조회 중 오류 발생:', error);
    throw error;
  }
};