import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from './ui/Modal.jsx';
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
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

const StudentTable = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

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
      const res = await axios.get('http://localhost:3000/api/v1/all-users');
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/v1/delete/${id}`);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("Rating") ? Number(value) : value,
    }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3000/api/v1/edit/${editUserId}`, formData);
      setEditUserId(null);
      fetchUsers();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleAddUser = async () => {
    try {
      await axios.post(`http://localhost:3000/api/v1/create`, formData);
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
            {filteredUsers.map((user) => (
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
                    <MenuItem onClick={() => handleEditClick(user)}>
                      <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                    </MenuItem>
                    <MenuItem onClick={() => handleDelete(user._id)}>
                      <DeleteIcon fontSize="small" sx={{ mr: 1, color: 'red' }} /> Delete
                    </MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

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
          />
        ))}
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
          />
        ))}
      </Modal>
    </Box>
  );
};

export default StudentTable;
