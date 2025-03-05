import axios from 'axios';

const getAxiosConfig = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        }
    };
};

const scheduleApi = {
    getSchedules: async (wsId) => {
        const response = await axios.get(
            `http://localhost:8080/schedule?wsId=${wsId}`,
            getAxiosConfig()
        );
        return response.data;
    },

    getSchedule: async (scheduleNumber) => {
        const response = await axios.get(
            `http://localhost:8080/schedule/${scheduleNumber}`,
            getAxiosConfig()
        );
        return response.data;
    },

    createSchedule: async (scheduleData) => {
        const response = await axios.post(
            'http://localhost:8080/schedule',
            scheduleData,
            getAxiosConfig()
        );
        return response.data;
    },

    updateSchedule: async (scheduleNumber, changeScheduleDTO) => {
        const token = localStorage.getItem('token');
        const response = await axios.put(
            `http://localhost:8080/schedule/${scheduleNumber}`,
            changeScheduleDTO,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    },

    deleteSchedule: async (scheduleNumber) => {
        const response = await axios.delete(
            `http://localhost:8080/schedule/${scheduleNumber}`,
            getAxiosConfig()
        );
        return response.data;
    },

    assignSchedule: async (scheduleNumber) => {
        const response = await axios.put(
            `http://localhost:8080/schedule/${scheduleNumber}/assignees`,
            {},
            getAxiosConfig()
        );
        return response.data;
    },

    changeStatus: async (scheduleNumber, status) => {
        const response = await axios.put(
            `http://localhost:8080/schedule/${scheduleNumber}/status?status=${status}`,
            {},
            getAxiosConfig()
        );
        return response.data;
    }
};

export default scheduleApi; 