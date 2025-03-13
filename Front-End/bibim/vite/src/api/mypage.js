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

  return scheduleList.map(schedule => ({
    id: schedule.scheduleNumber.toString(),
    title: schedule.scheduleTitle,
    start: schedule.scheduleStartDate,
    end: schedule.scheduleFinishDate,
    backgroundColor: schedule.color || '#1976d2',
    borderColor: schedule.color || '#1976d2',
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