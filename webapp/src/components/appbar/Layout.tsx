import React, { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material"; // Import useMediaQuery and useTheme
import Appbar from "./Appbar";

const drawerWidth = 260;
// Define the breakpoint where the sidebar transition logic should take effect.
// Assuming the sidebar should shift content on medium screens (md) and above.
const mobileBreakpoint = 'md'; 

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up(mobileBreakpoint)); // True if screen is 'md' or larger
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine the left margin:
  // 1. If sidebar is open AND it's a desktop view, use drawerWidth to push content.
  // 2. Otherwise (sidebar closed or on mobile), use 0 margin.
  const mainContentMargin = sidebarOpen && isDesktop ? `${drawerWidth}px` : 0;

  return (
    <Box>
      {/* Assuming Appbar handles displaying the full sidebar component (not shown) */}
      <Appbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <Box
        component="main"
        sx={{
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          // Only apply margin transition on larger screens
          marginLeft: mainContentMargin, 
          paddingTop: "64px", // AppBar height, ensure content starts below it
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
