import { Stack, type SxProps, type Theme } from "@mui/material";
import { TimeField, type TimeValidationError } from '@mui/x-date-pickers';
import { type FieldChangeHandlerContext } from "@mui/x-date-pickers/internals/hooks/useField";
import dayjs, { type Dayjs } from 'dayjs';
import { useImmer } from "use-immer";
import { type TimeSpan } from "./timersSlice";

export interface TimeSpanProps {
    label: string
    timeSpan: TimeSpan
    sx?: SxProps<Theme>
    onTimeSpanChanged: (timeSpan: TimeSpan) => void
}

export function TimeSpanInput(props: TimeSpanProps) {
    const [date, updateDate] = useImmer<Dayjs | null>(convertTimeSpanToDate(props.timeSpan));

    const onChanged = (value: Dayjs | null, context: FieldChangeHandlerContext<TimeValidationError>) => {
        updateDate(value);
    }

    const onBlurred = () => {
        const timeSpan = convertDateToTimeSpan(date);
        props.onTimeSpanChanged({ ...timeSpan })
    }

    function convertTimeSpanToDate(t: TimeSpan): Dayjs {
        const unixEpochInMs = ((t.minutes * 60) + t.seconds) * 1000;
        return dayjs(unixEpochInMs);
    }
    
    function convertDateToTimeSpan(d: Dayjs | null): TimeSpan {
        return {
            minutes: d?.minute() ?? 0,
            seconds: d?.second() ?? 0
        };
    }

    return (
        <Stack direction="row" sx={props.sx}>
            <TimeField
                label={props.label + " (mm:ss)"}
                value={date}
                onChange={onChanged}
                onBlur={onBlurred}
                size="small"
                format="mm:ss"
            />
        </Stack>
    )
}