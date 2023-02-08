import { Stack, TextField } from "@mui/material"
import { useImmer } from "use-immer"
import { type TimeSpan } from "./timersSlice"

export interface TimeSpanProps {
    timeSpan: TimeSpan
    onTimeSpanChanged: (timeSpan: TimeSpan) => void
}

export function TimeSpanInput(props: TimeSpanProps) {
    const [timeSpan, updateTimeSpan] = useImmer(props.timeSpan);

    const onMinutesChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        let minutes = Math.floor(e.target.valueAsNumber)
        if (minutes < 0) minutes = 0;
        
        updateTimeSpan(draft => {
            draft.minutes = minutes
        })
    }

    const onSecondsChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        let seconds = Math.floor(e.target.valueAsNumber);
        if (seconds < 0) seconds = 0;
        if (seconds > 59) seconds = 59;

        updateTimeSpan(draft => {
            draft.seconds = seconds
        })
    }

    const onTimeSpanBlurred = () => {
        props.onTimeSpanChanged({ ...timeSpan })
    }

    return (
        <Stack direction="row">
            <TextField
                    type="number"
                    variant="outlined"
                    size="small"
                    label="Minutes"
                    value={timeSpan.minutes}
                    onChange={onMinutesChanged}
                    onBlur={onTimeSpanBlurred}
                    inputProps={{ min: 0, max: 60 }}
                    sx={{
                        '& fieldset': {
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0
                        }
                    }}
                />
            <TextField
                    type="number"
                    variant="outlined"
                    size="small"
                    label="Seconds"
                    value={timeSpan.seconds.toString().padStart(2, "0")}
                    onChange={onSecondsChanged}
                    onBlur={onTimeSpanBlurred}
                    inputProps={{ min: 0, max: 59 }}
                    sx={{
                        marginLeft: "-1px",
                        '& fieldset': {
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0
                        }
                    }}
                />
        </Stack>
    )
}