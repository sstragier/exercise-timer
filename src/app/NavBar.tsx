import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export function NavBar() {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1}}>
                    Exercise Timer
                </Typography>
                <Button color="inherit" component={Link} to="/timers">Timers</Button>
            </Toolbar>
        </AppBar>
    )
}