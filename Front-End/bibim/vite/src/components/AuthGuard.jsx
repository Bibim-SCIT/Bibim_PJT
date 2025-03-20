import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ConfigContext } from 'contexts/ConfigContext';

// 인증되지 않은 사용자는 랜딩 페이지로 리다이렉트하는 AuthGuard 컴포넌트
const AuthGuard = ({ children }) => {
  const { user, token } = useContext(ConfigContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 인증 상태 체크
    if (!token || !user) {
      console.log('🚫 인증되지 않은 사용자 감지. 랜딩 페이지로 리다이렉트합니다.');
      navigate('/', { replace: true });
    }
  }, [token, user, navigate, location]);

  // 사용자가 인증된 경우에만 자식 컴포넌트 렌더링
  return <>{(token && user) ? children : null}</>;
};

export default AuthGuard; 