import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, CssBaseline, Typography, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  FormControl, InputLabel, Select, MenuItem, Chip, Avatar, CircularProgress, Switch
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import { toast } from 'react-hot-toast';
import { getAvatarColor } from '../utils/projectsHelper';

const CustomStatusSwitch = styled(Switch)(({ theme }) => ({
  width: 76,
  height: 26,
  padding: 0,
  display: 'flex',
  '& .MuiSwitch-switchBase': {
    padding: 3,
    color: '#fff',
    '&.Mui-checked': {
      transform: 'translateX(50px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#4caf50',
        opacity: 1,
        border: 0,
        '&:before': {
          content: '"ACTIVE"',
          position: 'absolute',
          left: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#fff',
          fontSize: '0.62rem',
          fontWeight: 'bold',
        },
        '&:after': {
          content: '""',
        },
      },
    },
  },
  '& .MuiSwitch-thumb': {
    width: 20,
    height: 20,
    boxShadow: 'none',
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: '#f44336',
    opacity: 1,
    position: 'relative',
    '&:after': {
      content: '"INACTIVE"',
      position: 'absolute',
      right: 6,
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#fff',
      fontSize: '0.62rem',
      fontWeight: 'bold',
    },
  },
}));

const Users = () => {
  const { company } = useParams();
  const username = localStorage.getItem('username') || '';
  const userId = localStorage.getItem('user_id') || 'system';
  const currentUserRole = localStorage.getItem('role') || 'Owner'; // Mocking role for now

  const canManageUsers = currentUserRole === 'Owner' || currentUserRole === 'Admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const initialFormState = {
    name: '',
    email: '',
    mobile: '',
    designation: '',
    role: 'Viewer',
    status: 'Active',
    profile_image: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users?company_name=${company}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [company]);

  const handleOpenModal = (user = null, viewOnly = false) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        designation: user.designation || '',
        role: user.role || 'Viewer',
        status: user.status || 'Active',
        profile_image: user.profile_image || ''
      });
      if (viewOnly) {
        setViewModalOpen(true);
      } else {
        setIsEdit(true);
        setModalOpen(true);
      }
    } else {
      setSelectedUser(null);
      setFormData(initialFormState);
      setIsEdit(false);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setViewModalOpen(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Name and Email are required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setSaving(true);
      let url = `${import.meta.env.VITE_API_URL}/users/`;
      let method = 'POST';
      let bodyData = { ...formData };

      if (isEdit) {
        url = `${import.meta.env.VITE_API_URL}/users/${selectedUser.id}`;
        method = 'PUT';
      } else {
        url = `${url}?company_name=${company}`;
        bodyData.created_by = { id: userId, name: username };
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(isEdit ? "User updated successfully" : "User created successfully. Password sent to email.");
        if (data.generated_password) {
          console.log("For testing purposes, generated password is:", data.generated_password);
        }
        handleCloseModal();
        fetchUsers();
      } else {
        const errData = await res.json();
        let errMsg = "Failed to save user";

        if (Array.isArray(errData.detail)) {
          // FastAPI validation error format
          errMsg = errData.detail.map(err => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join(', ');
        } else if (errData.detail) {
          errMsg = errData.detail;
        }

        toast.error(errMsg);
      }
    } catch (err) {
      toast.error("Error saving user");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`User status changed to ${newStatus}`);
        fetchUsers();
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const handleDelete = (id) => {
    toast((t) => (
      <Box>
        <Typography variant="body2" mb={1} color="text.primary">Are you sure you want to delete this user?</Typography>
        <Box display="flex" gap={1} justifyContent="flex-end">
          <Button size="small" onClick={() => toast.dismiss(t.id)}>No</Button>
          <Button size="small" variant="contained" color="error" onClick={async () => {
            toast.dismiss(t.id);
            try {
              const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
                method: 'DELETE'
              });
              if (res.ok) {
                toast.success("User deleted successfully");
                fetchUsers();
              } else {
                toast.error("Failed to delete user");
              }
            } catch (err) {
              toast.error("Error deleting user");
            }
          }}>Yes</Button>
        </Box>
      </Box>
    ), { duration: Infinity, style: { minWidth: '300px' }, position: 'top-center' });
  };

  const columns = [
    {
      field: 'sno',
      headerName: 'S.No',
      width: 70,
      renderCell: (params) => {
        return params.api.getAllRowIds().indexOf(params.id) + 1;
      }
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1.5,
      minWidth: 160,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, width: '100%', height: '100%' }}>
          <Typography variant="body2">{params.value}</Typography>
          <Avatar src={params.row.profile_image} sx={{ width: 32, height: 32, bgcolor: getAvatarColor(params.row.name || params.value), fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' }}>
            {params.value ? params.value.charAt(0) : 'U'}
          </Avatar>
        </Box>
      )
    },
    { field: 'email', headerName: 'Email', flex: 2, minWidth: 180 },
    { field: 'designation', headerName: 'Designation', flex: 1.2, minWidth: 130 },
    { field: 'role', headerName: 'Role', flex: 1, minWidth: 110 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <CustomStatusSwitch 
            checked={params.value === 'Active'} 
            onChange={() => handleToggleStatus(params.row)} 
          />
        </Box>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 100,
      getActions: (params) => {
        const actions = [];

        if (canManageUsers) {
          actions.push(
            <GridActionsCellItem
              key="edit"
              icon={<EditIcon fontSize="small" />}
              label="Edit"
              onClick={() => handleOpenModal(params.row, false)}
            />,
            <GridActionsCellItem
              key="delete"
              icon={<DeleteIcon fontSize="small" color="error" />}
              label="Delete"
              onClick={() => handleDelete(params.row.id)}
            />
          );
        }
        return actions;
      }
    }
  ];

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        <Sidebar company={company} activeMenu="Users" />

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <TopNav company={company} username={username} />

          <Box sx={{ p: '10px', flexGrow: 1, overflowY: 'auto' }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">User Management</Typography>
                  <Typography variant="body1" color="text.secondary">Manage your organization's users and roles.</Typography>
                </Box>
                {canManageUsers && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                    sx={{ px: 3, py: 1 }}
                  >
                    Create User
                  </Button>
                )}
              </Box>

              <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', borderRadius: 3, p: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', minHeight: 400 }}>
                <DataGrid
                  rows={users}
                  columns={columns}
                  loading={loading}
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  disableRowSelectionOnClick
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': { borderColor: 'rgba(0,0,0,0.06)' },
                    '& .MuiDataGrid-columnHeaders': { bgcolor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid rgba(0,0,0,0.08)' },
                    '& .MuiDataGrid-row:hover': { bgcolor: 'rgba(0,102,204,0.02)' }
                  }}
                />
              </Box>

            </Box>
          </Box>
        </Box>
      </Box>

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
          {isEdit ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>

            <TextField label="Name" required fullWidth value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Email" type="email" required fullWidth value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              <TextField label="Mobile Number" fullWidth value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
            </Box>

            <TextField label="Designation" fullWidth value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select value={formData.role} label="Role" onChange={e => setFormData({ ...formData, role: e.target.value })}>
                  <MenuItem value="Super Admin">Super Admin</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Project Manager">Project Manager</MenuItem>
                  <MenuItem value="Developer">Developer</MenuItem>
                  <MenuItem value="Tester">Tester</MenuItem>
                  <MenuItem value="Viewer">Viewer</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={formData.status} label="Status" onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {!isEdit && (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', bgcolor: 'rgba(0,0,0,0.03)', p: 1.5, borderRadius: 2 }}>
                * Password will be auto-generated by the system and sent to the user's email address.
              </Typography>
            )}

          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 3 }}>
          <Button onClick={handleCloseModal} color="inherit" sx={{ fontWeight: 500 }} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ px: 4 }} disabled={saving}>
            {saving ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Save Changes' : 'Create User')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* VIEW DIALOG */}
      <Dialog open={viewModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={selectedUser?.profile_image} sx={{ width: 56, height: 56, bgcolor: getAvatarColor(selectedUser?.name), color: '#fff', fontWeight: 'bold' }}>
            {selectedUser?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">{selectedUser?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{selectedUser?.designation}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.08)', pb: 1 }}>
              <Typography color="text.secondary">Email</Typography>
              <Typography fontWeight={500}>{selectedUser?.email}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.08)', pb: 1 }}>
              <Typography color="text.secondary">Mobile</Typography>
              <Typography fontWeight={500}>{selectedUser?.mobile || '-'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.08)', pb: 1 }}>
              <Typography color="text.secondary">Role</Typography>
              <Typography fontWeight={500}>{selectedUser?.role}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1 }}>
              <Typography color="text.secondary">Status</Typography>
              <Chip
                label={selectedUser?.status}
                size="small"
                sx={{
                  bgcolor: selectedUser?.status === 'Active' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                  color: selectedUser?.status === 'Active' ? '#4caf50' : '#f44336',
                  fontWeight: 500
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Users;
