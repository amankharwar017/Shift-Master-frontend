import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";

const drawerWidth = 240;

function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      className="dashboard-sidebar"
      sx={{ width: drawerWidth, flexShrink: 0 }}
    >
      <List className="sidebar-list">
        <ListItemButton
          selected
          className="sidebar-dashboard-button"
        >
          <ListItemIcon className="sidebar-icon">
            <DashboardIcon />
          </ListItemIcon>

          <ListItemText
            primary="Dashboard"
            className="sidebar-text"
          />
        </ListItemButton>
      </List>
    </Drawer>
  );
}

export default Sidebar;