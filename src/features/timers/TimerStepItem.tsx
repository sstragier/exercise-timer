import { Delete as DeleteIcon } from "@mui/icons-material";
import { Box, Checkbox, FormControlLabel, FormGroup, IconButton, Paper, Stack, TextField } from "@mui/material";
import { useAppSelector } from "app/hooks";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useImmer } from "use-immer";
import { selectTimerStepById, timerStepDeleted, timerStepUpdated, type TimeSpan } from "./timersSlice";
import { TimeSpanInput } from "./TimeSpanInput";

interface TimerStepItemProps {
    timerId: string
    stepId: string
}

export function TimerStepItem({ timerId, stepId } : TimerStepItemProps) {
    const stateStep = useAppSelector(state => selectTimerStepById(state, { timerId, stepId }));
    if (!stateStep) return null
    
    const [step, updatestep] = useImmer(stateStep)
    const dispatch = useDispatch();

    useEffect(() => {
        onStepBlurred()
    }, [step.duration, step.iterationGap])

    const onNameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        updatestep(draft => {
            draft.name = e.target.value
        })
    }

    const onDurationChanged = (duration: TimeSpan) => {
        updatestep(draft => {
            draft.duration = duration
        })
    }

    const onRepeatChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        updatestep(draft => {
            draft.repeat = e.target.checked
        })
    }
    
    const onIterationsChanged = (e: React.FocusEvent<HTMLInputElement>) => {
        let iterations = Math.floor(e.target.valueAsNumber);
        if (iterations < 1) iterations = 1;

        updatestep(draft => {
            draft.iterations = iterations
        })
    }

    const onIterationGapChanged = (iterationGap: TimeSpan) => {
        updatestep(draft => {
            draft.iterationGap = iterationGap
        })
    }

    function onStepBlurred() {
        dispatch(timerStepUpdated({ timerId, step }))
    }

    function onDelete() {
        dispatch(timerStepDeleted({ timerId, stepId }))
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
                        onChange={onNameChanged}
                        onBlur={onStepBlurred}
                    />
                    <TimeSpanInput timeSpan={step.duration} onTimeSpanChanged={d => onDurationChanged(d)} />
                    <FormGroup>
                        <FormControlLabel
                            label="Repeat"
                            control={<Checkbox checked={step.repeat} onChange={e => onRepeatChanged(e)} onBlur={onStepBlurred} />}
                        />
                    </FormGroup>
                    <Box flexGrow={1} textAlign="right">
                        <IconButton onClick={onDelete}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </Stack>
                {step.repeat && <Stack direction="row" gap={2}>
                    <TextField
                            type="number"
                            variant="outlined"
                            size="small"
                            label="Iterations"
                            value={step.iterations}
                            onChange={onIterationsChanged}
                            onBlur={onStepBlurred}
                            inputProps={{ min: 1 }}
                        />
                    <TimeSpanInput timeSpan={step.iterationGap} onTimeSpanChanged={d => onIterationGapChanged(d)} />
                </Stack>}
            </Stack>
        </Paper>
    )
}