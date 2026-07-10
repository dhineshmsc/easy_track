import React from 'react';
import { Box, IconButton, InputBase, Avatar, Typography, Badge, Menu, MenuItem, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BusinessIcon from '@mui/icons-material/Business';

const TopNav = ({ company, username }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    handleMenuClose();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <Box sx={{
      height: 70,
      display: 'flex',
      alignItems: 'center',
      px: 4,
      borderBottom: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
      justifyContent: 'space-between'
    }}>
      {/* Left side: Company Name */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <BusinessIcon sx={{ color: 'primary.main', fontSize: 28 }} />
        <Typography variant="h6" fontWeight="600" sx={{ letterSpacing: 0.5 }}>
          {capitalize(company)} Workspace
        </Typography>
      </Box>

      {/* Middle: Global Search */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
        borderRadius: 2,
        px: 2,
        py: 0.5,
        width: 350,
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': { borderColor: 'primary.main' },
        transition: 'border-color 0.2s'
      }}>
        <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
        <InputBase 
          placeholder="Search projects, tasks, or users..." 
          sx={{ flex: 1, fontSize: '0.9rem' }} 
        />
      </Box>

      {/* Right side: Actions & Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton sx={{ color: 'text.secondary' }}>
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        
        <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '1rem', fontWeight: 'bold' }}>
            {getInitials(username)}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 4,
            sx: { mt: 1.5, minWidth: 200, borderRadius: 2 }
          }}
        >
          <MenuItem onClick={handleMenuClose}>Profile Settings</MenuItem>
          <MenuItem onClick={handleMenuClose}>Billing & Plans</MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default TopNav;
