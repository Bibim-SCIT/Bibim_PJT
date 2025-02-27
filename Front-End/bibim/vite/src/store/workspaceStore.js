import { configureStore } from '@reduxjs/toolkit';
import workspaceReducer from './workSpaceRedux';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

// 🔥 redux-persist 설정 (activeWorkspace만 저장)
const persistConfig = {
    key: 'workspace',
    storage,
    whitelist: ['activeWorkspace'] // 워크스페이스 리스트는 서버에서 다시 불러오므로 저장할 필요 없음
};

const persistedWorkspaceReducer = persistReducer(persistConfig, workspaceReducer);

// const store = configureStore({
//     reducer: {
//         workspace: persistedWorkspaceReducer
//     }
// });
export const store = configureStore({
    reducer: {
        workspace: workspaceReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // ✅ 직렬화 검사 비활성화
        }),
});

// 🔥 persistStore 적용
export const persistor = persistStore(store);
export default store;
