import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getWorkspaces } from '../api/workspaceApi'; // ✅ 개별 함수 가져오기


// ==========================
// 🚀 비동기 액션: 워크스페이스 목록 불러오기
// ==========================
// export const loadWorkspace = createAsyncThunk(
//     'workspace/loadWorkspace',
//     async (_, { rejectWithValue }) => {
//         try {
//             const data = await workspaceList();
//             return data;
//         } catch (error) {
//             return rejectWithValue(error);
//         }
//     }
// );
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




// ==========================
// 🎯 워크스페이스 상태 관리 Slice
// ==========================
// const workspaceSlice = createSlice({
//     name: 'workspace',
//     initialState: {
//         data: [],          // 유저가 가입한 워크스페이스 리스트
//         activeWorkspace: null, // 현재 선택된 워크스페이스
//         loading: false,
//         error: null
//     },
//     reducers: {
//         /**
//          * ✅ 현재 선택된 워크스페이스 변경
//          * 사용자가 워크스페이스를 변경했을 때 이를 Redux 상태에 반영
//          */
//         setActiveWorkspace: (state, action) => {
//             state.activeWorkspace = action.payload;
//         }
//     },
//     extraReducers: (builder) => {
//         builder
//             .addCase(loadWorkspace.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(loadWorkspace.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.data = action.payload;

//                 // 🔥 자동으로 첫 번째 워크스페이스를 선택
//                 if (!state.activeWorkspace && action.payload.length > 0) {
//                     state.activeWorkspace = action.payload[0];
//                 }
//             })
//             .addCase(loadWorkspace.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             });
//     }
// });
// ✅ 워크스페이스 상태 관리 Slice
// const workspaceSlice = createSlice({
//     name: 'workspace',
//     initialState: {
//         list: [],
//         loading: false,
//         error: null
//     },
//     reducers: {},
//     extraReducers: (builder) => {
//         builder
//             .addCase(loadWorkspace.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(loadWorkspace.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.list = action.payload;  // ✅ API 데이터 저장
//             })
//             .addCase(loadWorkspace.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             });
//     }
// });
const workspaceSlice = createSlice({
    name: 'workspace',
    initialState: {
        list: [], // ✅ 기본값을 빈 배열로 설정
        activeWorkspace: null,
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loadWorkspace.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadWorkspace.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload || []; // ✅ API에서 응답이 없을 경우 빈 배열 반환
            })
            .addCase(loadWorkspace.rejected, (state, action) => {
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
