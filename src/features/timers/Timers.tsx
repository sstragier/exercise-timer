import { Delete as DeleteIcon } from "@mui/icons-material";
import { Button, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Typography } from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { Link, useNavigate } from "react-router-dom";
import { selectAllTimers, timerAdded, timerDeleted, type Timer } from "./timersSlice";

export function Timers() {
    const timers = useAppSelector(selectAllTimers)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const onAdd = () => {
        const timer = { id: nanoid(), name: "", steps: [] };
        dispatch(timerAdded(timer))
        navigate(`/timers/${timer.id}`)
    }

    const onDeleteTimer = (timer: Timer) => {
        dispatch(timerDeleted({ timerId: timer.id }));
    }

    const stepElements = timers.map((t, i) => (
        <ListItem
            key={t.id}
            disablePadding
            divider={i < timers.length - 1}
            secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => onDeleteTimer(t)}>
                    <DeleteIcon />
                </IconButton>
            }
        >
            <ListItemButton component={Link} to={`/timers/${t.id}`}>
                <ListItemText primary={t.name} />
            </ListItemButton>
        </ListItem>
    ))

    return (
        <Stack gap={2}>
            <Typography variant="h3">Timers</Typography>
            <List>
                {stepElements}
            </List>
            <Stack direction="row" gap={1}>
                <Button variant="outlined" onClick={onAdd}>Add</Button>
            </Stack>
        </Stack>
    )
}