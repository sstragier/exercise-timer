import { Button, List, ListItem, ListItemButton, ListItemText, Stack, Typography } from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { Link, useNavigate } from "react-router-dom";
import { selectAllTimers, timerAdded } from "./timersSlice";

export function Timers() {
    const timers = useAppSelector(selectAllTimers)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const onAdd = () => {
        const timer = { id: nanoid(), name: "", steps: [] };
        dispatch(timerAdded(timer))
        navigate(`/timers/${timer.id}`)
    }

    const stepElements = timers.map((t, i) => (
        <ListItem key={t.id}>
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