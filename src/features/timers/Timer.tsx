import { Button, Stack, TextField, Typography } from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector } from "app/hooks";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { selectTimerById, selectTimerStepIds, timerNameUpdated, timerStepAdded, type TimerStep } from "./timersSlice";
import { TimerStepItem } from "./TimerStepItem";

const emptyStep: Omit<TimerStep, "id"> = {
    name: "",
    duration: { minutes: 0, seconds: 10 },
    repeat: false,
    iterations: 1,
    iterationGap: { minutes: 0, seconds: 0 }
};

let wakeLock: WakeLockSentinel | undefined;

export function Timer() {
    const { timerId } = useParams();
    if (!timerId) return <Typography variant="h3">Timer not found</Typography>

    const stateTimer = useAppSelector(state => selectTimerById(state, timerId));
    if (!stateTimer) return <Typography variant="h3">Timer not found</Typography>

    const stepIds = useAppSelector(state => selectTimerStepIds(state, timerId)) ?? [];

    const [timerName, setTimerName] = useState(stateTimer.name)
    const [isRunning, setIsRunning] = useState(false);
    const dispatch = useAppDispatch();

    const onNameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTimerName(e.target.value)
    }
    const onNameBlurred = () => {
        dispatch(timerNameUpdated({ id: timerId, name: timerName }))
    }

    const onAdd = () => {
        const newStep = { ...emptyStep, id: nanoid() }
        dispatch(timerStepAdded({ timerId, step: newStep }))
    }

    const onStart = async () => {
        try {
            console.log("started");
            setIsRunning(true)
            await acquireScreenLock();
            
            for (const step of stateTimer.steps) {
                // if (!isRunning) return;
                const totalSeconds = (step.duration.minutes * 60) + step.duration.seconds;
                await startSpeaking(`starting ${step.name}`);
                await new Promise(resolve => setTimeout(resolve, 5000))

                const iterations = step.repeat ? step.iterations : 1;
                for (let i = 0; i < iterations; i++) {
                    // if (!isRunning) return;
                    if (step.repeat && iterations > 1) await startSpeaking(`${i + 1}`);
                    if (totalSeconds > 0) {
                        await new Promise(resolve => setTimeout(resolve, totalSeconds * 1000))
                    }
                    
                    // if (!isRunning) return;
                    const totalGapSeconds = (step.iterationGap.minutes * 60) + step.iterationGap.seconds;
                    if (step.repeat && iterations > 1 && totalGapSeconds > 0 && i < iterations - 1) {
                        await startSpeaking("rest");
                        await new Promise(resolve => setTimeout(resolve, totalGapSeconds * 1000))
                    }
                }

                console.log("finished step: " + step.name)
                await startSpeaking(`finished ${step.name}`);
            }
            
            console.log("finished");
            setIsRunning(false)
        } finally {
            await wakeLock?.release();
            wakeLock = undefined;
        }
    }

    const stepElements = stepIds.map(id => (
        <TimerStepItem
            key={id}
            timerId={timerId}
            stepId={id}
        />
    ))

    return (
        <Stack gap={2}>
            <TextField
                variant="standard"
                value={timerName}
                onChange={onNameChanged}
                onBlur={onNameBlurred}
                InputProps={{ sx: { fontSize: "xx-large" } }}
            />
            {stepElements}
            <Stack direction="row" gap={1}>
                <Button variant="outlined" onClick={onAdd}>Add</Button>
                {isRunning
                    ? <Button variant="contained" onClick={() => setIsRunning(false)}>Stop</Button>
                    : <Button variant="contained" onClick={onStart}>Start</Button>
                }
            </Stack>
        </Stack>
    )

    async function acquireScreenLock(): Promise<boolean> {
        if (!("wakeLock" in navigator)) return true;
        if (wakeLock) return true;

        try {
            wakeLock = await navigator.wakeLock.request("screen");
            return true;
        } catch (e) {
            alert(e);
            return false;
        }
    }

    async function startSpeaking(message: string) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.voice = (await getVoices())[1]
        speechSynthesis.speak(utterance);
    }

    /**
     * The speech synthesis voices are not available when getVoices is first called, so use a promise that waits for
     * voices, if they are not loaded yet.
     * @returns The voices for text to speech
     */
    function getVoices() {
        return new Promise<SpeechSynthesisVoice[]>(resolve => {
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) return resolve(voices)

            // TODO there's a race condition where voiceschanged might get called before registering
            
            // If the voices weren't ready yet, wait for the event indicating they are available and then fetch them
            speechSynthesis.addEventListener("voiceschanged", onVoicesChanged)

            function onVoicesChanged() {
                resolve(speechSynthesis.getVoices())
                speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged)
            }
        })
    }
}