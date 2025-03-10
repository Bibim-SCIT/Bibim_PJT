import { useState } from 'react';
import tagApi from '../api/tag';

const useTagData = () => {
  const [largeTags, setLargeTags] = useState([]);
  const [mediumTags, setMediumTags] = useState([]);
  const [smallTags, setSmallTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLargeTags = async (wsId) => {
    try {
      const result = await tagApi.getLargeTags(wsId);
      console.log('대분류 태그 응답 데이터:', result);
      
      if (result.data) {
        setLargeTags(result.data);
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('대분류 태그 불러오기 실패:', error);
      setError(error);
      return [];
    }
  };

  const fetchMediumTags = async (wsId, largeTagNumber) => {
    if (!largeTagNumber) {
      setMediumTags([]);
      return [];
    }
    try {
      const result = await tagApi.getMediumTags(wsId, largeTagNumber);
      console.log('중분류 태그 응답:', result);
      
      if (result.data) {
        setMediumTags(result.data);
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('중분류 태그 불러오기 실패:', error);
      setError(error);
      return [];
    }
  };

  const fetchSmallTags = async (wsId, largeTagNumber, mediumTagNumber) => {
    if (!mediumTagNumber) {
      setSmallTags([]);
      return [];
    }
    try {
      const result = await tagApi.getSmallTags(wsId, largeTagNumber, mediumTagNumber);
      
      if (result.data) {
        setSmallTags(result.data);
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('소분류 태그 불러오기 실패:', error);
      setError(error);
      return [];
    }
  };

  return {
    largeTags,
    mediumTags,
    smallTags,
    loading,
    error,
    fetchLargeTags,
    fetchMediumTags,
    fetchSmallTags,
    setLoading
  };
};

export default useTagData; 