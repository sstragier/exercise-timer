import { Box } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { NavBar } from 'app/NavBar';
import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <NavBar />
      <Box px={2} py={1}>
        <Outlet />
      </Box>
    </LocalizationProvider>
  );
}


