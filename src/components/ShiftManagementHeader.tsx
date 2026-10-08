import { Box, Typography } from "@mui/material";

function ShiftManagementHeader() {
  return (
    <Box className="shift-management-header">
      <Typography variant="h4" className="shift-management-title">
        Shift Management
      </Typography>
      <Typography variant="body1" className="shift-management-subtitle">
        Manage and configure your organization shifts.
      </Typography>
    </Box>
  );
}

export default ShiftManagementHeader;
