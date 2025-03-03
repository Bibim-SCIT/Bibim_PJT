import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getWorkspaces } from '../api/workspaceApi'; // ✅ 개별 함수 가져오기


// ==========================
// 🚀 비동기 액션: 워크스페이스 목록 불러오기
// ==========================
export const loadWorkspace = createAsyncThunk(
    'workspace/loadWorkspace',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getWorkspaces(); // ✅ 올바른 함수 호출
            return data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

// ✅ 로그아웃 시 워크스페이스 상태 초기화 액션 추가
export const logoutWorkspace = () => ({
    type: 'workspace/logout'
});

// ✅ 리듀서에서 logoutWorkspace 처리
const workspaceReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'workspace/setActiveWorkspace':
            return { ...state, activeWorkspace: action.payload };
        case 'workspace/logout': // ✅ 로그아웃 시 상태 초기화
            return { ...state, activeWorkspace: null, list: [] };
        default:
            return state;
    }
};



// ==========================
// 🎯 워크스페이스 상태 관리 Slice
// ==========================
const workspaceSlice = createSlice({
    name: 'workspace',
    initialState: {
        list: [], // ✅ 기본값을 빈 배열로 설정
        // activeWorkspace: null,
        activeWorkspace: JSON.parse(localStorage.getItem('activeWorkspace')) || null, // 🔥 초기 상태에서 localStorage 활용
        loading: false,
        error: null
    },
    reducers: {
        setActiveWorkspace: (state, action) => {
            state.activeWorkspace = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadWorkspace.pending, (state) => {
                console.log("⏳ 워크스페이스 목록 로딩 중...");
                state.loading = true;
                state.error = null;
            })
            .addCase(loadWorkspace.fulfilled, (state, action) => {
                console.log("✅ 워크스페이스 목록 불러오기 성공:", action.payload);
                state.loading = false;
                state.list = action.payload || []; // ✅ API에서 응답이 없을 경우 빈 배열 반환

                // 🔥 기존 activeWorkspace가 없고, 새로운 데이터가 있으면 첫 번째 워크스페이스 선택
                if (!state.activeWorkspace && action.payload.length > 0) {
                    state.activeWorkspace = action.payload[0];
                    console.log("🔄 기본 워크스페이스 선택:", state.activeWorkspace);
                }
            })
            .addCase(loadWorkspace.rejected, (state, action) => {
                console.log("❌ 워크스페이스 목록 불러오기 실패:", action.payload);
                state.loading = false;
                state.error = action.payload;
            });
    }
});


// ==========================
// 📌 액션 및 리듀서 내보내기
// ==========================
export const { setActiveWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
