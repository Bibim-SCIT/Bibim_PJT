/* eslint-disable prettier/prettier */
// Redux Toolkit의 createSlice와 createAsyncThunk를 불러옵니다.
// createSlice: Redux의 slice(부분 상태 및 관련 액션)를 정의하는 함수입니다.
// createAsyncThunk: 비동기 액션을 생성하는 함수입니다.
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// API 호출 함수 workspaceList를 불러옵니다.
import workspaceList from '../api/workspaceApi';

/**
 * =============================
 * 비동기 액션 정의 (Async Thunk)
 * =============================
 * - Redux Toolkit의 createAsyncThunk를 사용하여 비동기 액션을 정의합니다.
 * - 첫 번째 매개변수: 액션의 이름 ('workspace/loadWorkspace').
 * - 두 번째 매개변수: 비동기 함수 (API 호출 및 데이터 처리).
 */
export const loadWorkspace = createAsyncThunk(
    'workspace/loadWorkspace', // 액션 이름: Redux DevTools 및 디버깅 시 표시됩니다.
    async (_, { rejectWithValue }) =>
    {
        try {
            // API 호출 (workspaceList) 및 결과 반환
            const data = await workspaceList();
            return data; // 비동기 함수가 성공하면 데이터를 반환
        } catch (error) {
            // 오류 발생 시 rejectWithValue로 오류 내용을 반환
            return rejectWithValue(error);
        }
    }
);


/**
 * ===================
 * Redux Slice 정의
 * ===================
 * - createSlice를 사용하여 Redux의 slice(부분 상태 및 액션)를 정의합니다.
 * - `name`: slice의 이름 ('workspace') → Redux DevTools에 표시됨.
 * - `initialState`: 해당 slice의 초기 상태.
 * - `reducers`: 동기 액션을 정의하는 부분 (여기서는 사용하지 않음).
 * - `extraReducers`: 비동기 액션을 정의하는 부분 (createAsyncThunk와 함께 사용됨).
 */
const workspaceSlice = createSlice({
    name: 'workspace', // slice 이름
    initialState: {
        data: null,   // API에서 가져온 워크스페이스 데이터 저장
        loading: false, // API 호출 상태 (로딩 중인지 여부)
        error: null   // API 호출 중 발생한 오류 저장
    },
    reducers: {}, // 동기 액션은 사용하지 않으므로 비워둠

    /**
     * ============================
     * extraReducers 정의 (Async)
     * ============================
     * - createAsyncThunk와 연결된 비동기 액션의 상태에 따라 실행됩니다.
     * - `builder.addCase()`로 각 상태를 정의합니다.
     */
    extraReducers: (builder) =>
    {
        builder
            /**
             * 1. loadWorkspace.pending
             * - API 호출이 시작되었을 때 실행됩니다.
             * - `state.loading`을 true로 설정하여 로딩 상태로 표시합니다.
             * - `state.error`를 null로 초기화하여 이전 오류를 지웁니다.
             */
            .addCase(loadWorkspace.pending, (state) =>
            {
                state.loading = true; // 로딩 상태 활성화
                state.error = null;   // 이전 오류 초기화
            })

            /**
             * 2. loadWorkspace.fulfilled
             * - API 호출이 성공했을 때 실행됩니다.
             * - `state.loading`을 false로 설정하여 로딩 상태를 종료합니다.
             * - `state.data`에 API에서 반환한 데이터를 저장합니다.
             */
            .addCase(loadWorkspace.fulfilled, (state, action) =>
            {
                state.loading = false;   // 로딩 상태 종료
                state.data = action.payload; // API에서 가져온 데이터 저장
            })

            /**
             * 3. loadWorkspace.rejected
             * - API 호출이 실패했을 때 실행됩니다.
             * - `state.loading`을 false로 설정하여 로딩 상태를 종료합니다.
             * - `state.error`에 API에서 반환한 오류를 저장합니다.
             */
            .addCase(loadWorkspace.rejected, (state, action) =>
            {
                state.loading = false;    // 로딩 상태 종료
                state.error = action.payload; // 오류 메시지 저장
            });
    }
});

// slice의 reducer를 내보냅니다. (Redux Store에서 사용하기 위함)
export default workspaceSlice.reducer;
