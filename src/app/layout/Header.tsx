import { AppBar, Toolbar, Typography } from "@mui/material";

function Header() {
  return (
    <AppBar position="fixed" elevation={0} className="dashboard-header" >
      <Toolbar className="dashboard-header-toolbar">
        <Typography variant="h6" component="div" className="dashboard-header-title" >
          ShiftMaster
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Header;