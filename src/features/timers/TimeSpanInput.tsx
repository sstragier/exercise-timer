import { Stack, TextField } from "@mui/material"
import { type TimeSpan } from "./timersSlice"

export interface TimeSpanProps {
    timeSpan: TimeSpan
    onTimeSpanChanged: (timeSpan: TimeSpan) => void
}

export function TimeSpanInput(props: TimeSpanProps) {
    const onMinutesChanged = (e: React.FocusEvent<HTMLInputElement>) => {
        let minutes = Math.floor(e.target.valueAsNumber)
        if (minutes < 0) minutes = 0;
        
        props.onTimeSpanChanged({ ...props.timeSpan, minutes })
    }

    const onSecondsChanged = (e: React.FocusEvent<HTMLInputElement>) => {
        let seconds = Math.floor(e.target.valueAsNumber);
        if (seconds < 0) seconds = 0;
        if (seconds > 59) seconds = 59;

        props.onTimeSpanChanged({ ...props.timeSpan, seconds })
    }

    return (
        <Stack direction="row">
            <TextField
                    type="number"
                    variant="outlined"
                    size="small"
                    label="Minutes"
                    value={props.timeSpan.minutes}
                    onBlur={onMinutesChanged}
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
                    value={props.timeSpan.seconds.toString().padStart(2, "0")}
                    onBlur={onSecondsChanged}
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