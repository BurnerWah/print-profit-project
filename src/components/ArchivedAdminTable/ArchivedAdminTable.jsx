import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TableCell,
  TableRow,
  styled,
  tableCellClasses,
} from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

function ArchivedAdminPage({ archivedUser }) {
  const dispatch = useDispatch();

  const [openRecover, setOpenRecover] = useState(false);

  // Styles table head to be black
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  // Opens Recover Dialog
  const handleRecoverClickOpen = () => {
    setOpenRecover(true);
  };

  // Closes Recover Dialog
  const handleRecoverClose = () => {
    setOpenRecover(false);
  };

  // sends dispatch to soft delete the user
  const recoverUser = () => {
    dispatch({
      type: 'SAGA_RECOVER_USER',
      payload: {
        aboutToBeRecoveredUser: archivedUser.user_id,
      },
    });
  };

  const [openDelete, setOpenDelete] = useState(false);

  // Opens Delete Dialog
  const handleDeleteClickOpen = () => {
    setOpenDelete(true);
  };

  // Closes Delete Dialog
  const handleDeleteClose = () => {
    setOpenDelete(false);
  };

  // sends dispatch to soft delete the user
  const deleteUser = () => {
    dispatch({
      type: 'SAGA_HARD_DELETE_USER',
      payload: {
        aboutToBeDeletedUser: archivedUser.user_id,
      },
    });
  };

  // formats created_at timestamp as readable string
  const stringifyDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const stringifiedDate = date.toLocaleDateString('en-us', options);
    return stringifiedDate;
  };

  return (
    <TableRow>
      {/* 👇This makes the name field background black in archived users table - not sure if that's what we want */}
      <StyledTableCell variant="head" scope="row">
        {archivedUser.user_name}
      </StyledTableCell>
      <StyledTableCell align="center">{archivedUser.email}</StyledTableCell>
      <StyledTableCell align="center">
        {stringifyDate(archivedUser.created_at)}
      </StyledTableCell>
      <StyledTableCell align="center">
        <Button
          type="button"
          onClick={handleRecoverClickOpen}
          variant="contained"
        >
          Recover
        </Button>
      </StyledTableCell>
      <StyledTableCell align="center">
        <Button
          color="error"
          type="button"
          onClick={handleDeleteClickOpen}
          variant="outlined"
        >
          Delete
        </Button>
      </StyledTableCell>

      {/* Recover Dialog */}
      <Dialog
        open={openRecover}
        onClose={handleRecoverClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'Are you sure you want to recover this account?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This user will be allowed access to this app again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={recoverUser} autoFocus variant="outlined">
            Recover
          </Button>
          <Button
            sx={{ color: 'black', outlineColor: 'black' }}
            onClick={handleRecoverClose}
            variant="outlined"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={openDelete}
        onClose={handleDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'Are you sure you want to permanently delete this account?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action cannot be undone. Please be careful!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={deleteUser} autoFocus>
            Delete
          </Button>
          <Button sx={{ color: 'black' }} onClick={handleDeleteClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </TableRow>
  );
}

export default ArchivedAdminPage;
