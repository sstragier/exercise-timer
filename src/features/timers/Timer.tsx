import { Button, Checkbox, FormControlLabel, FormGroup, Paper, Stack, TextField, Typography } from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector } from "app/hooks";
import React from "react";
import { useParams } from "react-router-dom";
import { useImmer } from "use-immer";
import { selectTimerById, timerNameUpdated, timerStepAdded, timerStepUpdated, type TimerStep, type TimeSpan } from "./timersSlice";
import { TimeSpanInput } from "./TimeSpanInput";

const emptyStep: Omit<TimerStep, "id"> = {
    name: "",
    duration: { minutes: 0, seconds: 10 },
    repeat: false,
    iterations: 1,
    iterationGap: { minutes: 0, seconds: 0 }
};

interface TimerStepItemProps {
    step: TimerStep
    onTimerStepChanged: (step: TimerStep) => void
}

function TimerStepItem({ step, onTimerStepChanged } : TimerStepItemProps) {
    const onNameChanged = (e: React.FocusEvent<HTMLInputElement>) => {
        onTimerStepChanged({ ...step, name: e.target.value })
    }

    const onDurationChanged = (duration: TimeSpan) => {
        onTimerStepChanged({ ...step, duration })
    }

    const onRepeatChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        onTimerStepChanged({ ...step, repeat: e.target.checked})
    }
    
    const onIterationsChanged = (e: React.FocusEvent<HTMLInputElement>) => {
        let iterations = Math.floor(e.target.valueAsNumber);
        if (iterations < 1) iterations = 1;

        onTimerStepChanged({ ...step, iterations})
    }

    const onIterationGapChanged = (iterationGap: TimeSpan) => {
        onTimerStepChanged({ ...step, iterationGap })
    }

    return (
        <Paper elevation={2} sx={{ p: 2, border: "solid 1px lightgray" }}>
            <Stack gap={2}>
                <Stack direction="row" gap={2}>
                    <TextField
                        type="text"
                        variant="outlined"
                        size="small"
                        label="Name"
                        value={step.name}
                        onBlur={onNameChanged}
                    />
                    <TimeSpanInput timeSpan={step.duration} onTimeSpanChanged={d => onDurationChanged(d)} />
                    <FormGroup>
                        <FormControlLabel
                            label="Repeat"
                            control={<Checkbox checked={step.repeat} onChange={e => onRepeatChanged(e)} />}
                        />
                    </FormGroup>

                </Stack>
                {step.repeat && <Stack direction="row" gap={2}>
                    <TextField
                            type="number"
                            variant="outlined"
                            size="small"
                            label="Iterations"
                            value={step.iterations}
                            onBlur={onIterationsChanged}
                            inputProps={{ min: 1 }}
                        />
                    <TimeSpanInput timeSpan={step.iterationGap} onTimeSpanChanged={d => onIterationGapChanged(d)} />
                </Stack>}
            </Stack>
        </Paper>
    )
}

export function Timer() {
    const { timerId } = useParams();
    if (!timerId) return <Typography variant="h3">Timer not found</Typography>

    const timer = useAppSelector(state => selectTimerById(state, timerId));
    if (!timer) return <Typography variant="h3">Timer not found</Typography>

    const [isRunning, setIsRunning] = useImmer(false);
    const dispatch = useAppDispatch();

    const onNameChanged = (e: React.FocusEvent<HTMLInputElement>) => {
        dispatch(timerNameUpdated({ id: timer.id, name: e.target.value }))
    }

    const onTimerStepChanged = (step: TimerStep, index: number) => {
        dispatch(timerStepUpdated({ id: timer.id, step }))
    }

    const onAdd = () => {
        const newStep = { ...emptyStep, id: nanoid() }
        dispatch(timerStepAdded({ id: timer.id, step: newStep }))
    }

    const onStart = async () => {
        console.log("started");
        setIsRunning(true)
        
        for (const step of timer.steps) {
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
    }

    const stepElements = timer.steps.map((s, i) => (
        <TimerStepItem
            key={s.id}
            step={s}
            onTimerStepChanged={step => onTimerStepChanged(step, i)}
        />
    ))

    return (
        <Stack gap={2}>
            <Typography variant="h3">Timer</Typography>
            <TextField
                variant="outlined"
                value={timer.name}
                onBlur={onNameChanged}
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