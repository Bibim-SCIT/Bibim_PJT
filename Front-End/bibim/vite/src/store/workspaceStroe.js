/* eslint-disable prettier/prettier */
import { configureStore } from '@reduxjs/toolkit';
import workspaceReducer from './workspaceRedux';

const store = configureStore({
    reducer: {
        workspace: workspaceReducer
    }
});

export default store;
