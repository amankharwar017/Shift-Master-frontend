import { configureStore } from "@reduxjs/toolkit";
import shiftReducer from "./slices/shiftSlice";

export const store = configureStore({ reducer: { shift: shiftReducer,}});

export type RootState = ReturnType<typeof store.getState>;