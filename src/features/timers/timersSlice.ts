import { createEntityAdapter, createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type RootState } from "app/store";

export interface Timer {
    id: string
    name: string
    steps: TimerStep[]
}

export interface TimerStep {
    id: string
    name: string
    duration: TimeSpan
    repeat: boolean
    iterations: number
    iterationGap: TimeSpan
}

export interface TimeSpan {
    minutes: number
    seconds: number
}

export const STORAGE_PREFIX = "TIMER_";

const timersAdapter = createEntityAdapter<Timer>();

const initialState = timersAdapter.getInitialState();

const timersSlice = createSlice({
    name: "timers",
    initialState,
    reducers: {
        fetchTimers(state) {
            const timers = Object.entries(localStorage)
                .filter(([k]) => k.startsWith(STORAGE_PREFIX))
                .map(([_, json]) => JSON.parse(json));

            timersAdapter.addMany(state, timers);
        },
        timerAdded(state, action: PayloadAction<Timer>) {
            saveTimer(action.payload);
            timersAdapter.addOne(state, action);
        },
        timerDeleted(state, action: PayloadAction<{ timerId: string }>) {
            const { timerId } = action.payload;
            deleteTimer(timerId);
            timersAdapter.removeOne(state, timerId);
        },
        timerNameUpdated(state, action: PayloadAction<{ id: string, name: string }>) {
            const { id, name } = action.payload;
            const timer = state.entities[id];
            if (!timer) return;
            
            timer.name = name;
            saveTimer(timer);
        },
        timerStepAdded(state, action: PayloadAction<{ timerId: string, step: TimerStep }>) {
            const { timerId, step } = action.payload;
            const timer = state.entities[timerId];
            if (!timer) return;
            
            timer.steps.push(step);
            saveTimer(timer);
        },
        timerStepDeleted(state, action: PayloadAction<{ timerId: string, stepId: string }>) {
            const { timerId, stepId } = action.payload;
            const timer = state.entities[timerId];
            if (!timer) return;
            
            timer.steps = timer.steps.filter(s => s.id !== stepId);
            saveTimer(timer);
        },
        timerStepUpdated(state, action: PayloadAction<{ timerId: string, step: TimerStep }>) {
            const { timerId, step } = action.payload;
            const timer = state.entities[timerId];
            if (!timer) return;
            
            timer.steps = timer.steps.map(s => s.id === step.id ? step : s);
            saveTimer(timer);
        }
    }
});

function saveTimer(timer: Timer) {
    localStorage.setItem(STORAGE_PREFIX + timer.id, JSON.stringify(timer));
}

function deleteTimer(timerId: string) {
    localStorage.removeItem(STORAGE_PREFIX + timerId);
}

export const {
    selectAll: selectAllTimers,
    selectById: selectTimerById,
} = timersAdapter.getSelectors((state: RootState) => state.timers)

export const selectTimerStepIds = createSelector(
    [ selectTimerById ],
    (timer) => timer?.steps.map(s => s.id)
);

interface SelectTimerStepByIdOptions { timerId: string, stepId: string }
export const selectTimerStepById = createSelector(
    [
        (state, options: SelectTimerStepByIdOptions) => selectTimerById(state, options.timerId),
        (_, options: SelectTimerStepByIdOptions) => options.stepId
    ],
    (timer, stepId) => timer?.steps.find(s => s.id === stepId)
);

export const {
    fetchTimers,
    timerAdded,
    timerDeleted,
    timerNameUpdated,
    timerStepAdded,
    timerStepDeleted,
    timerStepUpdated
} = timersSlice.actions;

export default timersSlice.reducer;