
import { AppBar, Toolbar, Typography, Box, IconButton } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

function Header() {
  return (
    <AppBar position="fixed" elevation={0} className="dashboard-header">
      <Toolbar className="dashboard-header-toolbar">
        <Box
          component="img"
          src="/dreamsol-logo.jpg"
          alt="DreamSol TeleSolutions"
          sx={{
            height: 44,
            width: "auto",
            maxWidth: 220,
            objectFit: "contain",
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginLeft: "auto", color: "#334155" }}>
          <IconButton color="inherit" aria-label="Notifications">
            <NotificationsNoneIcon />
          </IconButton>
          <IconButton color="inherit" aria-label="Admin" onClick={() => console.log("Admin clicked")}>
            <AccountCircleIcon />
            <Typography variant="body1" sx={{ ml: 1 }} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
