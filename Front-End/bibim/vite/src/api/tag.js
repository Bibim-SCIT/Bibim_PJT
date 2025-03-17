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

// ✅ 대분류 태그 삭제 API
export const deleteLargeTag = async (largeTagNumber) => {
  if (!largeTagNumber) {
    console.warn("🚨 deleteLargeTag: 필요한 데이터가 없습니다.");
    return;
  }

  try {
    console.log(`📌 deleteLargeTag 요청: ID(${largeTagNumber})`);
    await api.delete(`/schedule/tag/large`, {
      params: { largeTagNumber },
      ...getAxiosConfig(),
    });
    console.log(`✅ 대분류 태그 삭제 성공 (ID: ${largeTagNumber})`);
  } catch (error) {
    console.error(`❌ 대분류 태그 삭제 실패:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ 중분류 태그 삭제 API
export const deleteMediumTag = async (mediumTagNumber) => {
  if (!mediumTagNumber) {
    console.warn("🚨 deleteMediumTag: 필요한 데이터가 없습니다.");
    return;
  }

  try {
    console.log(`📌 deleteMediumTag 요청: ID(${mediumTagNumber})`);
    await api.delete(`/schedule/tag/medium`, {
      params: { mediumTagNumber },
      ...getAxiosConfig(),
    });
    console.log(`✅ 중분류 태그 삭제 성공 (ID: ${mediumTagNumber})`);
  } catch (error) {
    console.error(`❌ 중분류 태그 삭제 실패:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ 소분류 태그 삭제 API
export const deleteSmallTag = async (smallTagNumber) => {
  if (!smallTagNumber) {
    console.warn("🚨 deleteSmallTag: 필요한 데이터가 없습니다.");
    return;
  }

  try {
    console.log(`📌 deleteSmallTag 요청: ID(${smallTagNumber})`);
    await api.delete(`/schedule/tag/small`, {
      params: { smallTagNumber },
      ...getAxiosConfig(),
    });
    console.log(`✅ 소분류 태그 삭제 성공 (ID: ${smallTagNumber})`);
  } catch (error) {
    console.error(`❌ 소분류 태그 삭제 실패:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ 대분류 태그 수정 API
export const updateLargeTag = async (wsId, largeTagNumber, newTagName, newTagColor) => {
  console.log("📌 updateLargeTag 요청 데이터:", { wsId, largeTagNumber, newTagName, newTagColor });

  if (!wsId || !largeTagNumber || !newTagName) {
    console.warn("🚨 updateLargeTag: 필요한 데이터가 없습니다.");
    return;
  }

  try {
    const response = await api.put("/schedule/tag/large", {
      wsId,
      largeTagNumber,
      newTagName,
      newTagColor,
    }, getAxiosConfig());

    console.log(`✅ 대분류 태그 수정 완료: ${newTagName}`);
    return response.data;
  } catch (error) {
    console.error(`❌ 대분류 태그 수정 실패:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ 중분류 태그 수정 API
export const updateMediumTag = async (largeTagNumber, mediumTagNumber, newTagName) => {
  console.log("📌 updateMediumTag 요청 데이터:", { largeTagNumber, mediumTagNumber, newTagName });

  if (!largeTagNumber || !mediumTagNumber || !newTagName) {
    console.warn("🚨 updateMediumTag: 필요한 데이터가 없습니다.");
    return;
  }

  try {
    const response = await api.put("/schedule/tag/medium", {
      largeTagNumber,
      mediumTagNumber,
      newTagName,
    }, getAxiosConfig());

    console.log(`✅ 중분류 태그 수정 완료: ${newTagName}`);
    return response.data;
  } catch (error) {
    console.error(`❌ 중분류 태그 수정 실패:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ 소분류 태그 수정 API
export const updateSmallTag = async (mediumTagNumber, smallTagNumber, newTagName) => {
  console.log("📌 updateSmallTag 요청 데이터:", { mediumTagNumber, smallTagNumber, newTagName });

  if (!mediumTagNumber || !smallTagNumber || !newTagName) {
    console.warn("🚨 updateSmallTag: 필요한 데이터가 없습니다.");
    return;
  }

  try {
    const response = await api.put("/schedule/tag/small", {
      mediumTagNumber,
      smallTagNumber,
      newTagName,
    }, getAxiosConfig());

    console.log(`✅ 소분류 태그 수정 완료: ${newTagName}`);
    return response.data;
  } catch (error) {
    console.error(`❌ 소분류 태그 수정 실패:`, error.response?.data || error.message);
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
  deleteLargeTag,
  deleteMediumTag,
  deleteSmallTag,
  updateLargeTag,
  updateMediumTag,
  updateSmallTag,
  fetchAllTags,
};
