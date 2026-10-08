import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import NightlightIcon from "@mui/icons-material/Nightlight";

interface ShiftSummaryCardsProps {
  total: number;
  active: number;
  inactive: number;
  night: number;
}

function ShiftSummaryCards({ total, active, inactive, night }: ShiftSummaryCardsProps) {
  const cards = [
    { title: "Total Shifts", value: total, icon: <AccessTimeIcon />, className: "summary-total" },
    { title: "Active Shifts", value: active, icon: <CheckCircleIcon />, className: "summary-active" },
    { title: "Inactive Shifts", value: inactive, icon: <CancelIcon />, className: "summary-inactive" },
    { title: "Night Shifts", value: night, icon: <NightlightIcon />, className: "summary-night" },
  ];

  return (
    <Grid container spacing={1} sx={{ marginBottom: 3 }}>
      {cards.map((card) => (
        <Grid size={{ xs: 12, sm: 6, md: 6 }} key={card.title}>
          <Card elevation={0} className={`summary-card ${card.className}`}>
            <CardContent>
              <Box className="summary-card-content">
                <Box>
                  <Typography variant="body2" className="summary-card-title">
                    {card.title}
                  </Typography>
                  <Typography variant="h4" className="summary-card-value">
                    {card.value}
                  </Typography>
                </Box>
                <Box className="summary-card-icon">{card.icon}</Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default ShiftSummaryCards;