import PropTypes from 'prop-types';
import { createContext, useState, useEffect } from 'react';
import { getUserInfo } from "../api/auth";

// project imports
import defaultConfig from 'config';
import useLocalStorage from 'hooks/useLocalStorage';

// initial state
const initialState = {
  ...defaultConfig,
  user: null, // 로그인한 사용자 정보
  token: null, // 로그인 토큰
  onChangeFontFamily: () => { },
  onChangeBorderRadius: () => { },
  onReset: () => { },
  setUser: () => { },
  setToken: () => { },
  logout: () => { }
};

//

// ==============================|| CONFIG CONTEXT & PROVIDER ||============================== //

const ConfigContext = createContext(initialState);

function ConfigProvider({ children }) {
  const [config, setConfig] = useLocalStorage('berry-config-vite-ts', {
    fontFamily: initialState.fontFamily,
    borderRadius: initialState.borderRadius
  });

  // 로그인 상태 추가
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // ✅ 로그인 후 즉시 회원 정보 불러오기
  const fetchUserInfo = async () => {
    try {
      const data = await getUserInfo();
      console.log("🟢 사용자 정보 불러오기 성공:", data);
      // setUser(data); // ✅ 프로필 이미지 포함
      if (!data.profileImage || data.profileImage === "null") {
        console.warn("⚠️ 사용자 프로필 이미지가 없습니다. 기본 이미지 사용");
      }

      setUser({
        email: data.email,
        name: data.name,
        nationality: data.nationality,
        language: data.language,
        // profileImage: data.profileImage || "https://default-image.com/default.png" // ✅ 기본 이미지 처리
        profileImage: data.profileImage && data.profileImage !== "null"
          ? data.profileImage
          : "https://default-image.com/default.png" // ✅ 기본 이미지 설정
      });
    } catch (error) {
      console.error("❌ 사용자 정보 불러오기 실패:", error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('token'); // 오류 발생 시 토큰 삭제
    }
  };

  // ✅ 로그인 핸들러 (토큰 저장 후 `fetchUserInfo()` 실행)
  const handleLogin = async (email, password) => {
    try {
      const userInfo = await loginUser(email, password); // ✅ 로그인 후 사용자 정보 반환
      setToken(localStorage.getItem("token")); // ✅ 토큰 상태 업데이트
      setUser(userInfo); // ✅ 사용자 상태 업데이트
    } catch (error) {
      console.error("❌ 로그인 후 사용자 정보 불러오기 실패:", error);
    }
  };


  // ✅ 페이지 새로고침 시 로컬스토리지에서 토큰을 가져와 자동 로그인 처리
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUserInfo(); // ✅ 로그인 후 즉시 실행
    }
  }, []);
  // useEffect(() => {
  //   const savedToken = localStorage.getItem('token');
  //   if (savedToken) {
  //     console.log("🟢 저장된 토큰 감지됨:", savedToken);
  //     setToken(savedToken);

  //     // ✅ 저장된 토큰을 axios 헤더에 자동 설정
  //     api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
  //     console.log("🟢 요청 헤더에 저장된 토큰 설정 완료:", api.defaults.headers.common["Authorization"]);

  //     fetchUserInfo(); // ✅ 로그인 후 즉시 실행
  //   }
  // }, []);


  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeWorkspace'); // ✅ 워크스페이스 정보도 삭제
    setUser(null);
    setToken(null);
  };

  const onChangeFontFamily = (fontFamily) => {
    setConfig({
      ...config,
      fontFamily
    });
  };

  const onChangeBorderRadius = (event, newValue) => {
    setConfig({
      ...config,
      borderRadius: newValue
    });
  };

  const onReset = () => {
    setConfig({ ...defaultConfig });
  };

  return (
    <ConfigContext.Provider
      value={{
        ...config,
        onChangeFontFamily,
        onChangeBorderRadius,
        onReset,
        user,
        setUser,
        token,
        setToken,
        logout
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export { ConfigProvider, ConfigContext };

ConfigProvider.propTypes = { children: PropTypes.node };
 