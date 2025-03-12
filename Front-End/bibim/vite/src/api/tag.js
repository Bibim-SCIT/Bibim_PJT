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

// ✅ [공통] 대분류 태그 가져오기
export const fetchLargeTags = async (wsId) => {
  if (!wsId) {
    console.warn("🚨 fetchLargeTags: wsId가 없어서 요청을 중단합니다.");
    return [];
  }

  try {
    console.log(`📌 fetchLargeTags(${wsId}) API 요청 시작...`);

    const response = await api.get("/schedule/tag/large", {
      params: { wsId },
      ...getAxiosConfig(),
    });

    console.log("📌 API 응답 데이터:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("❌ fetchLargeTags API 요청 실패:", error.response?.data || error);
    throw error;
  }
};

// ✅ [공통] 중분류 태그 가져오기
export const fetchMediumTags = async (wsId, largeTagNumber) => {
  if (!wsId || !largeTagNumber) {
    console.warn("🚨 fetchMediumTags: 필요한 파라미터(wsId, largeTagNumber)가 없습니다.");
    return [];
  }

  try {
    console.log(`📌 fetchMediumTags(wsId: ${wsId}, largeTagNumber: ${largeTagNumber}) API 요청 시작...`);

    const response = await api.get("/schedule/tag/medium", {
      params: { wsId, largeTagNumber },
      ...getAxiosConfig(),
    });

    console.log("📌 API 응답 데이터:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("❌ fetchMediumTags API 요청 실패:", error.response?.data || error);
    throw error;
  }
};

// ✅ [공통] 소분류 태그 가져오기
export const fetchSmallTags = async (wsId, largeTagNumber, mediumTagNumber) => {
  if (!wsId || !largeTagNumber || !mediumTagNumber) {
    console.warn("🚨 fetchSmallTags: 필요한 파라미터(wsId, largeTagNumber, mediumTagNumber)가 없습니다.");
    return [];
  }

  try {
    console.log(`📌 fetchSmallTags(wsId: ${wsId}, largeTagNumber: ${largeTagNumber}, mediumTagNumber: ${mediumTagNumber}) API 요청 시작...`);

    const response = await api.get("/schedule/tag/small", {
      params: { wsId, largeTagNumber, mediumTagNumber },
      ...getAxiosConfig(),
    });

    console.log("📌 API 응답 데이터:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("❌ fetchSmallTags API 요청 실패:", error.response?.data || error);
    throw error;
  }
};

// ✅ 태그 생성 API
export const createTag = async (wsId, tagData) => {
  if (!wsId || !tagData.tagName || !tagData.tagType) {
    console.warn("🚨 createTag: 필요한 데이터가 없습니다.");
    return;
  }

  const payload = { wsId, tagName: tagData.tagName };

  // 중분류 & 소분류는 부모 태그 정보를 추가
  if (tagData.tagType === "medium" && tagData.parentTag) {
    payload.largeTagNumber = tagData.parentTag;
  } else if (tagData.tagType === "small" && tagData.parentTag && tagData.subParentTag) {
    payload.largeTagNumber = tagData.parentTag;
    payload.mediumTagNumber = tagData.subParentTag;
  }

  try {
    console.log(`📌 createTag(${tagData.tagType}) 요청 데이터:`, payload);

    await api.post(`/schedule/tag/${tagData.tagType}`, payload, getAxiosConfig());

    console.log(`✅ 태그(${tagData.tagName}) 생성 성공`);
  } catch (error) {
    console.error(`❌ createTag 실패:`, error.response?.data || error);
    throw error;
  }
};

// ✅ 태그 삭제 API
export const deleteTag = async (tagType, tagId) => {
  if (!tagId || !tagType) {
    console.warn("🚨 deleteTag: 필요한 데이터가 없습니다.");
    return;
  }

  try {
    console.log(`📌 deleteTag(${tagType}, ${tagId}) 요청`);
    const endpoint = `/schedule/tag/${tagType}?${tagType}TagNumber=${tagId}`;

    await api.delete(endpoint, getAxiosConfig());

    console.log(`✅ 태그 삭제 성공 (ID: ${tagId})`);
  } catch (error) {
    console.error(`❌ 태그 삭제 실패:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ 태그 수정 API
export const updateTag = async (wsId, tagType, tagId, newTagName) => {
  if (!wsId || !tagId || !newTagName || !tagType) {
    console.warn("🚨 updateTag: 필요한 데이터가 없습니다.");
    return;
  }

  try {
    console.log(`📌 updateTag(${tagType}, ${tagId}) → ${newTagName}`);

    await api.put(`/schedule/tag/${tagType}`, {
      wsId,
      tagNumber: tagId,
      newTagName: newTagName,
    }, getAxiosConfig());

    console.log(`✅ 태그 수정 완료: ${newTagName}`);
  } catch (error) {
    console.error(`❌ 태그 수정 실패:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ 전체 태그 조회 API (대, 중, 소분류 포함)
export const fetchAllTags = async (wsId) => {
  if (!wsId) {
    console.warn("🚨 fetchAllTags: wsId가 없습니다.");
    return [];
  }

  try {
    console.log(`📌 fetchAllTags(${wsId}) API 요청 시작...`);

    const response = await api.get("/schedule/tag", {
      params: { wsId },
      ...getAxiosConfig(),
    });

    console.log("📌 API 응답 데이터:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("❌ fetchAllTags API 요청 실패:", error.response?.data || error);
    throw error;
  }
};

export default {
  fetchLargeTags,
  fetchMediumTags,
  fetchSmallTags,
  createTag,
  deleteTag,
  updateTag,
  fetchAllTags,
};
