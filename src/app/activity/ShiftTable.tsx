
import { Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { DataGrid, type GridColDef, type GridPaginationModel, type GridSortModel } from "@mui/x-data-grid";
import type { ShiftResponse } from "../../types/shift";

interface ShiftTableProps {
  rows: ShiftResponse[];
  rowCount: number;
  paginationModel: GridPaginationModel;
  onPaginationChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortChange: (model: GridSortModel) => void;
  edit: (shiftId: number) => void;
  view: (shiftId: number) => void;
  deleteShift: (shiftId: number) => void;
  selectedShift: ShiftResponse | null;
  onCloseView: () => void;
}

function ShiftTable({
  rows,
  rowCount,
  paginationModel,
  onPaginationChange,
  sortModel,
  onSortChange,
  edit,
  view,
  deleteShift,
  selectedShift,
  onCloseView,
}: ShiftTableProps) {
  const columns: GridColDef<ShiftResponse>[] = [
    {
      field: "actions",
      headerName: "Action",
      minWidth: 150,
      flex: 1,
      resizable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box className="shift-table-actions">
          <Tooltip title="Delete">
            <IconButton size="small" className="shift-delete-button" onClick={() => deleteShift(params.row.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" className="shift-edit-button" onClick={() => edit(params.row.id)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View">
            <IconButton size="small" className="shift-view-button" onClick={() => view(params.row.id)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    {
      field: "shiftCode",
      headerName: "Shift Code",
      minWidth: 130,
      flex: 1,
      resizable: false,
      sortable: true,
      filterable: false,
      disableColumnMenu: true,
    },
    {
      field: "shiftName",
      headerName: "Shift Name",
      minWidth: 150,
      flex: 1,
      resizable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
    },
    {
      field: "shiftType",
      headerName: "Shift Type",
      minWidth: 130,
      flex: 1,
      resizable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
    },
    {
      field: "startTime",
      headerName: "Start Time",
      minWidth: 110,
      flex: 1,
      resizable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
    },
    {
      field: "endTime",
      headerName: "End Time",
      minWidth: 110,
      flex: 1,
      resizable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
    },
    {
      field: "workingHours",
      headerName: "Working Hours",
      minWidth: 130,
      flex: 1,
      resizable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
    },
    {
      field: "nightShift",
      headerName: "Night Shift",
      minWidth: 110,
      flex: 1,
      resizable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Chip
          label={params.row.nightShift ? "Yes" : "No"}
          size="small"
          color={params.row.nightShift ? "warning" : "default"}
          variant={params.row.nightShift ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "overtimeAllowed",
      headerName: "Overtime",
      minWidth: 100,
      flex: 1,
      resizable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Chip
          label={params.row.overtimeAllowed ? "Yes" : "No"}
          size="small"
          color={params.row.overtimeAllowed ? "success" : "default"}
          variant={params.row.overtimeAllowed ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 110,
      flex: 1,
      resizable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Chip
          label={params.row.status ? "Active" : "Inactive"}
          size="small"
          color={params.row.status ? "success" : "default"}
          variant={params.row.status ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Created On",
      minWidth: 160,
      flex: 1,
      resizable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const value = String(params.value || "");
        const [date, time] = value.split("T");
        return (
          <div style={{ lineHeight: "20px" }}>
            {date}
            <br />
            {time?.split(".")[0]}
          </div>
        );
      },
    },
    {
      field: "updatedAt",
      headerName: "Updated On",
      minWidth: 160,
      flex: 1,
      resizable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const value = String(params.value || "");
        const [date, time] = value.split("T");
        return (
          <div style={{ lineHeight: "20px" }}>
            {date}
            <br />
            {time?.split(".")[0]}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Card elevation={0} className="shift-table-card">
        <CardContent className="shift-table-card-content">
          <Box className="shift-table-header" sx={{ position: "relative" }}>
            <Box>
              <Typography variant="h6" className="shift-table-title">
                Shift List
              </Typography>
              <Typography variant="body2" className="shift-table-subtitle">
                Manage all configured shifts.
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                position: "absolute",
                right: 24,
                top: 44,
                whiteSpace: "nowrap",
                color: "#ffffff",
                fontWeight: 600,
              }}
            >
              Total: {rowCount}
            </Typography>
          </Box>
          <Box className="shift-table-wrapper">
            <Box className="shift-table-grid-wrapper">
              <DataGrid
                rows={rows}
                columns={columns}
                rowCount={rowCount}
                paginationMode="server"
                sortingMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={onPaginationChange}
                sortModel={sortModel}
                onSortModelChange={onSortChange}
                pageSizeOptions={[5, 10, 20, 50]}
                disableRowSelectionOnClick
                className="shift-data-grid"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
      <Dialog open={Boolean(selectedShift)} onClose={onCloseView} maxWidth="md" fullWidth>
        <DialogTitle>Shift Details</DialogTitle>
        <DialogContent dividers>
          {selectedShift && (
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
              <Typography><strong>Shift Code:</strong> {selectedShift.shiftCode}</Typography>
              <Typography><strong>Shift Name:</strong> {selectedShift.shiftName}</Typography>
              <Typography><strong>Display Name:</strong> {selectedShift.displayName}</Typography>
              <Typography><strong>Shift Type:</strong> {selectedShift.shiftType}</Typography>
              <Typography><strong>Start Time:</strong> {selectedShift.startTime}</Typography>
              <Typography><strong>End Time:</strong> {selectedShift.endTime}</Typography>
              <Typography><strong>Break Start:</strong> {selectedShift.breakStart || "-"}</Typography>
              <Typography><strong>Break End:</strong> {selectedShift.breakEnd || "-"}</Typography>
              <Typography><strong>Working Hours:</strong> {selectedShift.workingHours}</Typography>
              <Typography><strong>Grace In:</strong> {selectedShift.graceIn ?? "-"}</Typography>
              <Typography><strong>Grace Out:</strong> {selectedShift.graceOut ?? "-"}</Typography>
              <Typography><strong>Overtime Allowed:</strong> {selectedShift.overtimeAllowed ? "Yes" : "No"}</Typography>
              <Typography><strong>Night Shift:</strong> {selectedShift.nightShift ? "Yes" : "No"}</Typography>
              <Typography><strong>Weekly Off:</strong> {selectedShift.weeklyOff ? "Yes" : "No"}</Typography>
              <Typography><strong>Shift Color:</strong> {selectedShift.shiftColor}</Typography>
              <Typography><strong>Applicable Days:</strong> {selectedShift.applicableDays?.join(", ") || "-"}</Typography>
              <Typography><strong>Status:</strong> {selectedShift.status ? "Active" : "Inactive"}</Typography>
              <Typography><strong>Created On:</strong> {selectedShift.createdAt}</Typography>
              <Typography><strong>Updated On:</strong> {selectedShift.updatedAt}</Typography>
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography><strong>Description:</strong> {selectedShift.description || "-"}</Typography>
              </Box>
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography><strong>Remarks:</strong> {selectedShift.remarks || "-"}</Typography>
              </Box>
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography><strong>Attachment:</strong> {selectedShift.attachment || "-"}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseView}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ShiftTable;
