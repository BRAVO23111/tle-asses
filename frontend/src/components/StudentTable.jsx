import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from './ui/Modal.jsx';
import StudentProfile from './StudentProfile.jsx';
import {
  TextField,
  IconButton,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  InputAdornment,
  Menu,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import api from '../utils/api.js';

const StudentTable = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cfLoading, setCfLoading] = useState(false);
  const [cfError, setCfError] = useState('');
  const [viewingUser, setViewingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    codeforcesId: '',
    currentRating: '',
    maxRating: '',
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/all-users');
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/delete/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleEditClick = (user) => {
    setEditUserId(user._id);
    setFormData({ ...user });
    handleCloseMenu();
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setFormData({
      name: '',
      email: '',
      contact: '',
      codeforcesId: '',
      currentRating: '',
      maxRating: '',
    });
  };

  const fetchCodeforcesData = async (handle) => {
    setCfLoading(true);
    setCfError('');
    try {
      const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
      const data = await res.json();
      console.log('Codeforces data:', data);

      if (data.status === 'OK') {
        const user = data.result[0];
        setFormData((prev) => ({
          ...prev,
          name: user.firstName
            ? `${user.firstName} ${user.lastName}`
            : user.handle,
          currentRating: user.rating || '',
          maxRating: user.maxRating || '',
        }));
      } else {
        setCfError('Invalid Codeforces handle');
      }
    } catch (err) {
      setCfError('Failed to fetch Codeforces data');
    } finally {
      setCfLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('Rating') ? Number(value) : value,
    }));
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/edit/${editUserId}`, formData);
      setEditUserId(null);
      fetchUsers();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleAddUser = async () => {
    try {
      await api.post(`/create`, formData);
      setIsAdding(false);
      fetchUsers();
    } catch (error) {
      console.error('Add failed:', error);
    }
  };

  const handleOpenMenu = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const handleViewDetails = (user) => {
    setViewingUser(user);
    handleCloseMenu();
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(filter.toLowerCase()) ||
    user.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <TextField
          label="Search Users"
          variant="outlined"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: '50%' }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add User
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell align="right">Current Rating</TableCell>
              <TableCell align="right">Max Rating</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.contact}</TableCell>
                  <TableCell align="right">{user.currentRating}</TableCell>
                  <TableCell align="right">{user.maxRating}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleOpenMenu(e, user._id)}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={selectedUserId === user._id}
                      onClose={handleCloseMenu}
                    >
                      <MenuItem onClick={() => handleViewDetails(user)}>
                        <VisibilityIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} /> View Details
                      </MenuItem>
                      <MenuItem onClick={() => handleEditClick(user)}>
                        <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                      </MenuItem>
                      <MenuItem onClick={() => handleDelete(user._id)}>
                        <DeleteIcon fontSize="small" sx={{ mr: 1, color: 'red' }} /> Delete
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* View Details Modal */}
      {viewingUser && (
        <Modal
          title="Student Profile"
          isOpen={!!viewingUser}
          onClose={() => setViewingUser(null)}
          onSubmit={() => setViewingUser(null)}
        >
          <StudentProfile size user={viewingUser} />
        </Modal>
      )}

      {/* Edit Modal */}
      <Modal
        title="Edit User"
        isOpen={!!editUserId}
        onClose={() => setEditUserId(null)}
        onSubmit={handleUpdate}
      >
        {Object.entries(formData).map(([key, value]) => (
          <TextField
            key={key}
            label={key}
            name={key}
            value={value}
            onChange={handleChange}
            type={key.includes('Rating') ? 'number' : 'text'}
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment:
                key === 'codeforcesId' ? (
                  <InputAdornment position="end">
                    <IconButton onClick={() => fetchCodeforcesData(formData.codeforcesId)}>
                      <RefreshIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null,
            }}
          />
        ))}
        {cfLoading && <CircularProgress size={20} sx={{ mt: 2 }} />}
        {cfError && <Typography color="error">{cfError}</Typography>}
      </Modal>

      {/* Add Modal */}
      <Modal
        title="Add New User"
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        onSubmit={handleAddUser}
      >
        {Object.entries(formData).map(([key, value]) => (
          <TextField
            key={key}
            label={key}
            name={key}
            value={value}
            onChange={handleChange}
            type={key.includes('Rating') ? 'number' : 'text'}
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment:
                key === 'codeforcesId' ? (
                  <InputAdornment position="end">
                    <IconButton onClick={() => fetchCodeforcesData(formData.codeforcesId)}>
                      <RefreshIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null,
            }}
          />
        ))}
        {cfLoading && <CircularProgress size={20} sx={{ mt: 2 }} />}
        {cfError && <Typography color="error">{cfError}</Typography>}
      </Modal>
    </Box>
  );
};

export default StudentTable;