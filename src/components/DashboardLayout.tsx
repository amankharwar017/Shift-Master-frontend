import { Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onAddShift: () => void;
  showAddButton: boolean;
}

function DashboardLayout({
  children,
  onAddShift,
  showAddButton,
}: DashboardLayoutProps) {
  return (
    <Box className="dashboard-layout">
      <Sidebar />

      <Box component="main" className="dashboard-main">
        <Header />
         <Box className="dashboard-content"> {children} </Box>
         {showAddButton && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddShift}
            className="dashboard-add-button"
          >
            Add New Shift
          </Button>
         )}
      </Box>
    </Box>
  );
}

export default DashboardLayout;