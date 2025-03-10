import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api/auth'; // 기존 API 활용
import { useContext } from 'react';
import { ConfigContext } from '../../../contexts/ConfigContext';

export default function GoogleAuthCallback() {
    const navigate = useNavigate();
    const { setUser, setToken } = useContext(ConfigContext);

    useEffect(() => {
        // ✅ 현재 URL에서 `code` 파라미터 추출
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
            console.log("🔹 Google OAuth 인증 코드:", code);

            // ✅ 백엔드에 code 전송
            api.post('/members/google-login', { code })
                .then((response) => {
                    const { accessToken, userInfo } = response.data.data;

                    console.log("🟢 Google 로그인 성공! 토큰:", accessToken);
                    console.log("🟢 사용자 정보:", userInfo);

                    // ✅ 토큰 저장
                    localStorage.setItem('token', accessToken);
                    setToken(accessToken);

                    // ✅ 사용자 정보 저장
                    setUser(userInfo);

                    // ✅ 로그인 후 페이지 이동
                    navigate('/ws-select');
                })
                .catch((error) => {
                    console.error("❌ Google 로그인 실패:", error);
                    navigate('/login'); // 로그인 실패 시 다시 로그인 페이지로 이동
                });
        }
    }, [navigate, setToken, setUser]);

    return <p>Google 로그인 중...</p>;
}
