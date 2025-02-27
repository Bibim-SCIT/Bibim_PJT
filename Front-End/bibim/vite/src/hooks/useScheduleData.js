import { useState, useCallback } from 'react';
import scheduleApi from '../api/scheduleApi';

const useScheduleData = () => {
  const [schedules, setSchedules] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 스케줄 데이터를 FullCalendar 형식으로 변환하는 함수
  const transformScheduleData = (scheduleData) => {
    return scheduleData.map(schedule => ({
      id: schedule.scheduleNumber,
      title: schedule.scheduleTitle,
      start: schedule.scheduleStartDate,
      end: schedule.scheduleFinishDate,
      backgroundColor: schedule.color || '#3788d8',
      borderColor: schedule.color || '#3788d8',
      textColor: '#ffffff',
      extendedProps: {
        ...schedule
      }
    }));
  };

  const fetchSchedules = useCallback(async (wsId) => {
    if (!wsId) return;
    
    setLoading(true);
    try {
      const response = await scheduleApi.getSchedules(wsId);
      console.log('스케줄 데이터 응답:', response);
      
      if (response?.data) {
        const transformedSchedules = transformScheduleData(response.data);
        setSchedules(transformedSchedules);
        console.log('변환된 스케줄:', transformedSchedules);
      } else {
        console.warn('스케줄 데이터가 없습니다:', response);
        setSchedules([]);
      }
    } catch (error) {
      console.error('스케줄 목록 불러오기 실패:', error);
      setError(error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSchedule = async (scheduleNumber) => {
    setLoading(true);
    try {
      const result = await scheduleApi.getSchedule(scheduleNumber);
      if (result.data) {
        setCurrentSchedule(result.data);
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('스케줄 상세 불러오기 실패:', error);
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async (scheduleData) => {
    setLoading(true);
    try {
      const result = await scheduleApi.createSchedule(scheduleData);
      if (result.success) {
        await fetchSchedules(scheduleData.wsId);
      }
      return result;
    } catch (error) {
      console.error('스케줄 생성 실패:', error);
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = async (scheduleNumber, scheduleData) => {
    setLoading(true);
    try {
      const result = await scheduleApi.updateSchedule(scheduleNumber, scheduleData);
      if (result.success) {
        await fetchSchedules(scheduleData.wsId);
      }
      return result;
    } catch (error) {
      console.error('스케줄 수정 실패:', error);
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (scheduleNumber, wsId) => {
    setLoading(true);
    try {
      const result = await scheduleApi.deleteSchedule(scheduleNumber);
      if (result.success) {
        await fetchSchedules(wsId);
      }
      return result;
    } catch (error) {
      console.error('스케줄 삭제 실패:', error);
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const assignSchedule = async (scheduleNumber, wsId) => {
    setLoading(true);
    try {
      const result = await scheduleApi.assignSchedule(scheduleNumber);
      if (result.success) {
        await fetchSchedules(wsId);
      }
      return result;
    } catch (error) {
      console.error('스케줄 할당 실패:', error);
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (scheduleNumber, status, wsId) => {
    setLoading(true);
    try {
      const result = await scheduleApi.changeStatus(scheduleNumber, status);
      if (result.success) {
        await fetchSchedules(wsId);
      }
      return result;
    } catch (error) {
      console.error('스케줄 상태 변경 실패:', error);
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    schedules,
    currentSchedule,
    loading,
    error,
    fetchSchedules,
    fetchSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    assignSchedule,
    changeStatus,
    setLoading
  };
};

export default useScheduleData; 