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

const tagApi = {
  getLargeTags: async (wsId) => {
    if (!wsId) {
      throw new Error('워크스페이스 ID가 필요합니다.');
    }
    const response = await axios.get(
      `http://localhost:8080/schedule/tag/large?wsId=${wsId}`,
      getAxiosConfig()
    );
    return response.data;
  },

  getMediumTags: async (largeTagNumber) => {
    if (!largeTagNumber) {
      throw new Error('대분류 태그 번호가 필요합니다.');
    }
    const response = await axios.get(
      `http://localhost:8080/schedule/tag/medium`,
      {
        ...getAxiosConfig(),
        params: { largeTagNumber }
      }
    );
    return response.data;
  },

  getSmallTags: async (mediumTagNumber) => {
    if (!mediumTagNumber) {
      throw new Error('중분류 태그 번호가 필요합니다.');
    }
    const response = await axios.get(
      `http://localhost:8080/schedule/tag/small`,
      {
        ...getAxiosConfig(),
        params: { mediumTagNumber }
      }
    );
    return response.data;
  }
};

export default tagApi; 