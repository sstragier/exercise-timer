import { configureStore, type Action, type ThunkAction } from '@reduxjs/toolkit';
import counterReducer from 'features/counter/counterSlice';
import timersReducer from "features/timers/timersSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    timers: timersReducer
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
