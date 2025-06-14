import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Modal = ({ title, isOpen, onClose, onSubmit, children, viewOnly = false }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>{children}</DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {viewOnly ? (
          <Button onClick={onClose} color="primary" variant="contained">
            Close
          </Button>
        ) : (
          <>
            <Button onClick={onClose} color="inherit" variant="outlined">
              Cancel
            </Button>
            <Button onClick={onSubmit} color="primary" variant="contained">
              Save
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default Modal;
