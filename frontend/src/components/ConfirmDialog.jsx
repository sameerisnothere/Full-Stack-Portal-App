import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Slide,
} from "@mui/material";

/**
 * Transition component for Dialog slide animation.
 * Slides the dialog up when opening.
 */
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * ConfirmDialog component for displaying a confirmation prompt.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {string} props.title - Title text for the dialog.
 * @param {string} props.message - Message text for the dialog body.
 * @param {Function} props.onConfirm - Callback triggered when the user confirms.
 * @param {Function} props.onCancel - Callback triggered when the user cancels or closes the dialog.
 *
 * @returns {JSX.Element} Confirmation dialog with cancel and confirm buttons.
 */
export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition} // Slide animation
      keepMounted
      onClose={onCancel} // Handle backdrop click or escape key
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      {/* Dialog title */}
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>

      {/* Dialog content with message */}
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>

      {/* Dialog actions: Cancel and Confirm */}
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
