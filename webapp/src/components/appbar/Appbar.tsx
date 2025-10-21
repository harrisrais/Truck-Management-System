import React, { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  Button,
  useMediaQuery,
  Avatar,
  Tooltip,
  useTheme, ClickAwayListener, List, ListItem, Typography
} from "@mui/material";
import { broadcastLogout } from "@/utils/authSync";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShareIcon from "@mui/icons-material/Share";
import ChatIcon from "@mui/icons-material/Chat";
import NotificationsIcon from "@mui/icons-material/Notifications";
import JobForm from "@/components/jobs/jobFormComponents/JobForm";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import CreateIcon from "@mui/icons-material/Create";
import RoomPreferencesIcon from "@mui/icons-material/RoomPreferences";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { sidebarSections } from "@/utils/jobConstants";
import SidebarSection from "./SidebarSection";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useThemeContext } from "@/contexts/ThemeContext";

interface AppbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Define drawer width for use in responsiveness
const drawerWidth = 260;
const mobileBreakpoint = 'md'; // Consistent with Layout.tsx

const Appbar: React.FC<AppbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [avatarMenuEl, setAvatarMenuEl] = useState<null | HTMLElement>(null);

  const { user, isLoading } = useUser();
  const router = useRouter();
  const theme = useTheme();

  const isDropdownOpen = Boolean(anchorEl);
  const isAvatarMenuOpen = Boolean(avatarMenuEl);

  // Use MUI breakpoint check for consistency
  const isDesktop = useMediaQuery(theme.breakpoints.up(mobileBreakpoint));
  const isMobile = !isDesktop; // Treat anything below 'md' as mobile/tablet for sidebar

  const { setDarkMode } = useThemeContext();

  // Dropdown logic
  const handleToggleDropdown = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(isDropdownOpen ? null : event.currentTarget);
  };
  const handleCloseDropdown = () => setAnchorEl(null);

  const handleOpenJobModal = () => {
    handleCloseDropdown();
    setIsJobFormOpen(true);
  };
  const handleCloseJobModal = () => setIsJobFormOpen(false);

  const handleSidebarItemClick = (path?: string) => {
    // Close sidebar on item click, especially important for mobile drawer
    setSidebarOpen(false);
    if (path) router.push(path);
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAvatarMenuEl(event.currentTarget);
  };
  const handleAvatarMenuClose = () => setAvatarMenuEl(null);

  const getSectionIcon = (title: string) => {
    switch (title) {
      case "Operate":
        return <ManageSearchIcon />;
      case "Track":
        return <MyLocationIcon />;
      case "Finance":
        return <MonetizationOnIcon />;
      case "Analyze":
        return <FindInPageIcon />;
      case "Manage":
        return <CreateIcon />;
      case "Configure":
        return <RoomPreferencesIcon />;
      default:
        return null;
    }
  };

  const handleDarkModeToggle = () => setDarkMode((prev) => !prev);

  // Determine Drawer variant based on screen size
  const drawerVariant = isDesktop ? "persistent" : "temporary";
  // Determine if drawer should be open on desktop/mobile
  const drawerOpen = isDesktop ? sidebarOpen : sidebarOpen;

  // Handle sidebar toggle click
  const handleMenuToggle = () => setSidebarOpen(!sidebarOpen);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#00263A",
          borderBottom: "5px solid #F57C00",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Left Menu Icon - Always visible */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            onClick={handleMenuToggle}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo and Create New Dropdown */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Logo */}
            <Link href="/" passHref legacyBehavior>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <Image
                  src={
                    isMobile
                      ? "/Jobs-Images/Logo.png"
                      : "/Jobs-Images/allotracLogo.png"
                  }
                  alt="Allotrac Logo"
                  width={isMobile ? 60 : 200}
                  height={60}
                  priority
                />
              </Box>
            </Link>

            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Button
                onClick={handleToggleDropdown}
                sx={{
                  color: "white",
                  fontWeight: 350,
                  textTransform: "none",
                  display: "flex",
                  alignItems: "center",
                  minWidth: "auto",
                  px: isMobile ? 1 : 2,
                }}
                endIcon={isDropdownOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {isDesktop && "CREATE NEW"}
              </Button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <ClickAwayListener onClickAway={handleCloseDropdown}>
                  <Box
                    sx={{
                      color: "black",
                      position: "absolute",
                      top: "100%",
                      left: 40,
                      mt: 1,
                      bgcolor: "background.paper",
                      borderRadius: 1,
                      boxShadow: 3,
                      zIndex: 1300,
                      minWidth: 100,
                    }}
                  >
                    <List sx={{ p: 0 }}>
                      {/* Jobs item */}
                      <ListItem
                        onClick={() => {
                          handleOpenJobModal();
                          handleCloseDropdown();
                        }}
                        sx={{
                          cursor: "pointer",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <Typography>Jobs</Typography>
                      </ListItem>

                      {/* Disabled Projects item */}
                      <ListItem
                        sx={{
                          cursor: "not-allowed",
                          color: "text.disabled",
                          opacity: 0.6,
                        }}
                      >
                        <Typography>Projects</Typography>
                      </ListItem>
                    </List>
                  </Box>
                </ClickAwayListener>
              )}
            </Box>

            {/* Job Form Modal */}
            <JobForm open={isJobFormOpen} onClose={handleCloseJobModal} />
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Right Side Icons */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 1.5 : 2, // Slightly increase gap on mobile
            }}
          >
            {/* SHARE PAGE Button (Icon only on mobile) */}
            <Button
              sx={{
                color: "#57abe4ff",
                textTransform: "none",
                minWidth: 'auto',
                p: 0, // Remove padding from button for better fit
              }}
              startIcon={<ShareIcon />}
            >
              {isDesktop && "SHARE PAGE"} {/* Show text only on desktop */}
            </Button>

            {/* Dark Mode Toggle */}
            <Tooltip title="Toggle Mode" arrow>
              <IconButton
                aria-label="Toggle dark mode"
                onClick={handleDarkModeToggle}
              >
                <DarkModeIcon sx={{ color: "white" }} />
              </IconButton>
            </Tooltip>

            {/* Static Logo Image (Assuming this is an application/fleet avatar) */}
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                display: isMobile ? { xs: 'none', sm: 'flex' } : 'flex',
              }}
            >
              <img
                src="https://static.allotrac.com.au/allie/logo.png"
                alt="Logo"
                style={{ width: "80%", height: "80%", objectFit: "contain" }}
              />
            </Box>

            {/* Chat Icon */}
            <Tooltip title="Chat" arrow>
              <ChatIcon sx={{ color: "white", cursor: "pointer" }} />
            </Tooltip>

            {/* Notifications Icon */}
            <Tooltip title="Notifications" arrow>
              <NotificationsIcon sx={{ color: "white", cursor: "pointer", display: isMobile ? { xs: 'none', sm: 'flex' } : 'flex' }} />
            </Tooltip>

            {/* User Avatar and Menu */}
            {!isLoading && user && (
              <>
                <IconButton onClick={handleAvatarClick}>
                  <Avatar
                    alt={user?.nickname || "User"}
                    src={user?.picture || undefined}
                    imgProps={{ referrerPolicy: "no-referrer" }}
                    sx={{ width: 32, height: 32 }}
                  />
                </IconButton>

                {/* Avatar Dropdown Menu */}
                <Menu
                  anchorEl={avatarMenuEl}
                  open={isAvatarMenuOpen}
                  onClose={handleAvatarMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem
                    component={Link}
                    href="/user-lounge"
                    onClick={handleAvatarMenuClose}
                  >
                    User Lounge
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      handleAvatarMenuClose();
                      broadcastLogout(); // notify all tabs
                      window.location.href = "/api/auth/logout"; // logout current tab
                    }}
                  >
                    Log Out
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      {/* Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={isMobile ? handleMenuToggle : undefined} // Only close on mobile click outside
        variant={drawerVariant} // 'temporary' for mobile, 'persistent' for desktop
        PaperProps={{
          style: {
            width: drawerWidth,
            marginTop: "64px",
            // For persistent desktop drawer, make sure it doesn't cover content
            ...(!isMobile && { height: `calc(100% - 64px)` }),
          }
        }}
      >
        <Box
          sx={{ mt: 2, pb: 0, mb: 0, boxShadow: "none", overflow: "hidden" }}
        >
          {sidebarSections.map((section) => (
            <SidebarSection
              key={section.title}
              title={section.title}
              icon={getSectionIcon(section.title)}
              items={section.items}
              onItemClick={handleSidebarItemClick}
            />
          ))}
        </Box>
      </Drawer>
    </Box>
  );
};

export default Appbar;
