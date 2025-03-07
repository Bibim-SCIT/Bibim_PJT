import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig(({ mode }) => {
    // 환경 변수 로드
    const env = loadEnv(mode, process.cwd(), '');
    const API_URL = `${env.VITE_APP_BASE_NAME}`;
    const PORT = 3000;

    return {
        server: {
            open: true, // 서버 실행 시 자동으로 브라우저 열기
            port: PORT, // 기본 포트 3000
            host: true,
            proxy: {
                "/api": {
                    target: "http://localhost:8080", // 백엔드 서버 주소
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(/^\/api/, ""), // `/api` 제거
                },
            },
        },
        build: {
            chunkSizeWarningLimit: 1600,
        },
        preview: {
            open: true,
            host: true,
        },
        define: {
            global: 'window',
        },
        resolve: {
            alias: [
                // 절대 경로 설정
                // { find: 'assets', replacement: path.join(process.cwd(), 'src/assets') },
            ],
        },
        base: API_URL,
        plugins: [react(), jsconfigPaths()],
    };
});
