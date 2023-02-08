import { Box } from "@mui/material";
import { NavBar } from 'app/NavBar';
import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <>
      <NavBar />
      <Box px={2} py={1}>
        <Outlet />
      </Box>
    </>
  );
}


