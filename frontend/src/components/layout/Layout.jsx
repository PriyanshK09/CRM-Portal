"use client"

import { useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Button,
  Stack,
  Badge,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  PeopleAlt as PeopleIcon,
  Campaign as CampaignIcon,
  History as HistoryIcon,
  Storage as StorageIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Help as HelpIcon,
} from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"

const drawerWidth = 250

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleSignOut = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Error signing out", error)
    }
  }

  const menuItems = [
    { 
      text: "Dashboard", 
      icon: <DashboardIcon fontSize="small" />, 
      path: "/" 
    },
    { 
      text: "All Segments", 
      icon: <PeopleIcon fontSize="small" />, 
      path: "/segments/list" 
    },
    { 
      text: "Segment Builder", 
      icon: <PeopleIcon fontSize="small" />, 
      path: "/segments" 
    },
    { 
      text: "All Campaigns", 
      icon: <CampaignIcon fontSize="small" />, 
      path: "/campaigns/list" 
    },
    { 
      text: "Create Campaign", 
      icon: <CampaignIcon fontSize="small" />, 
      path: "/campaigns/new" 
    },
    { 
      text: "Campaign History", 
      icon: <HistoryIcon fontSize="small" />, 
      path: "/campaigns/history" 
    },
    { 
      text: "Data Ingestion", 
      icon: <StorageIcon fontSize="small" />, 
      path: "/data" 
    },
  ]

  const getPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath === "/") return "Dashboard";
    if (currentPath === "/segments/list") return "All Segments";
    if (currentPath === "/segments") return "Segment Builder";
    if (currentPath === "/campaigns/list") return "All Campaigns";
    if (currentPath === "/campaigns/new") return "Create Campaign";
    if (currentPath === "/campaigns/history") return "Campaign History";
    if (currentPath === "/data") return "Data Ingestion";
    return "";
  }

  const isActive = (path) => {
    return location.pathname === path;
  }

  const handleNavigation = (path, e) => {
    if (location.pathname === '/segments' && !path.startsWith('/segments')) {
      e.stopPropagation();
      window.location.href = path;
    } else {
      navigate(path);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', height: 64 }}>
        <Typography variant="h6" noWrap component="div" sx={{ 
          fontWeight: 700, 
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <CampaignIcon sx={{ fontSize: 24 }} />
          Xeno CRM
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="medium"
          sx={{
            borderRadius: 1.5,
            py: 1,
            mb: 1,
            justifyContent: 'flex-start',
            fontWeight: 600
          }}
          onClick={(e) => handleNavigation('/campaigns/new', e)}
        >
          <CampaignIcon fontSize="small" sx={{ mr: 1 }} />
          New Campaign
        </Button>
      </Box>
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            px: 1, 
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}
        >
          Navigation
        </Typography>
      </Box>
      <List sx={{ flexGrow: 1, px: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              onClick={(e) => handleNavigation(item.path, e)}
              sx={{
                borderRadius: 1.5,
                py: 1.2,
                backgroundColor: isActive(item.path) ? 'rgba(62, 99, 221, 0.08)' : 'transparent',
                color: isActive(item.path) ? 'primary.main' : 'text.primary',
                '&:hover': {
                  backgroundColor: isActive(item.path) ? 'rgba(62, 99, 221, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 36, 
                color: isActive(item.path) ? 'primary.main' : 'text.secondary'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: isActive(item.path) ? 600 : 500,
                  fontSize: '0.875rem'
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Box 
          sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: '#F1F5FD', // Lighter background for better contrast
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#111827' }}>
            Need Help?
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: '#4B5563' }}>
            Check our documentation for guidance
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              sx={{ 
                bgcolor: '#1E40AF', // Dark blue for better contrast
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#1E3A8A'
                },
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              View Docs
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#F8FAFC" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
          height: 64,
        }}
      >
        <Toolbar sx={{ height: 64, display: 'flex', justifyContent: 'space-between', px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
              {getPageTitle()}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Search" arrow>
              <IconButton
                size="small"
                sx={{ 
                  backgroundColor: 'grey.100',
                  borderRadius: 1.5,
                  '&:hover': { backgroundColor: 'grey.200' }
                }}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Help" arrow>
              <IconButton
                size="small"
                sx={{ 
                  backgroundColor: 'grey.100',
                  borderRadius: 1.5,
                  '&:hover': { backgroundColor: 'grey.200' }
                }}
              >
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Notifications" arrow>
              <IconButton
                size="small"
                sx={{ 
                  backgroundColor: 'grey.100',
                  borderRadius: 1.5,
                  '&:hover': { backgroundColor: 'grey.200' }
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Settings" arrow>
              <IconButton
                size="small"
                sx={{ 
                  backgroundColor: 'grey.100',
                  borderRadius: 1.5,
                  '&:hover': { backgroundColor: 'grey.200' }
                }}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Box sx={{ ml: 0.5 }}>
              <IconButton 
                onClick={handleMenuOpen}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                }}
              >
                <Avatar 
                  src={currentUser?.photoURL} 
                  alt={currentUser?.displayName} 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: currentUser?.photoURL ? 'transparent' : 'primary.light' 
                  }}
                >
                  {!currentUser?.photoURL && currentUser?.displayName?.charAt(0)}
                </Avatar>
              </IconButton>
              <Menu 
                anchorEl={anchorEl} 
                open={Boolean(anchorEl)} 
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 2,
                  sx: { mt: 1.5, borderRadius: 2, minWidth: 200, overflow: 'visible' }
                }}
              >
                <Box sx={{ pt: 2, pb: 1.5, px: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {currentUser?.displayName || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentUser?.email || 'user@example.com'}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem 
                  onClick={handleMenuClose} 
                  sx={{ 
                    py: 1.5, 
                    px: 2,
                    fontSize: '0.875rem'
                  }}
                >
                  Account Settings
                </MenuItem>
                <MenuItem 
                  onClick={handleMenuClose}
                  sx={{ 
                    py: 1.5, 
                    px: 2,
                    fontSize: '0.875rem'
                  }}
                >
                  Support Center
                </MenuItem>
                <Divider />
                <MenuItem 
                  onClick={handleSignOut} 
                  sx={{ 
                    color: 'error.main', 
                    fontWeight: 500,
                    py: 1.5, 
                    px: 2,
                    fontSize: '0.875rem'
                  }}
                >
                  Sign out
                </MenuItem>
              </Menu>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              bgcolor: 'background.paper'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          overflow: 'auto',
          height: 'calc(100vh - 64px)',
          maxWidth: '100%',
        }}
      >
        <Box sx={{ 
          width: '100%', 
          // margin: '0 auto', // Remove auto margin to prevent centering
          // Adding container width constraints for different screen sizes
          // to better utilize space on large displays
          maxWidth: {
            lg: '100%',
            xl: '100%'
          },
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
