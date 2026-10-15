import { useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Box, Button, Card, CardContent, Grid, IconButton, Paper, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import NightlightIcon from "@mui/icons-material/Nightlight";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "../../components/TextField";
import MultiselectAutoComplete from "../../components/MultiselectAutoComplete";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";

interface ShiftSearchFormProps {
  totalShifts: number;
  activeShifts: number;
  inactiveShifts: number;
  nightShifts: number;
  onSummaryClick: (filter: "all" | "active" | "inactive" | "night") => void;
  onSearch: (searchData: Record<string, any>) => void;
  onFiltersChange?: (filters: SearchData, removeFilter: (key: string, value?: string) => void) => void;
}

type SearchData = Record<string, any>;
function ShiftSearchForm({ onSearch, onFiltersChange, totalShifts, activeShifts, inactiveShifts, nightShifts, onSummaryClick }: ShiftSearchFormProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const getDate = (daysAgo = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };
  const initialFormData = {
    searchText: "",
    shiftType: [] as string[],
    nightShift: "all",
    status: null as boolean | null,
    createdDateFrom: getDate(7),
    createdDateTo: getDate(),
  };
  const [formData, setFormData] = useState(initialFormData);
  const formDataRef = useRef(formData);
  formDataRef.current = formData;
  const [showMoreFilters, setShowMoreFilters] = useState(false);
 
  
  const buildFilters = (data: typeof formData): SearchData => {
    const filters: SearchData = {};
    if (data.searchText.trim()) filters.searchText = data.searchText.trim();
    if (data.createdDateFrom && data.createdDateFrom !== initialFormData.createdDateFrom) filters.createdDateFrom = data.createdDateFrom;
    if (data.createdDateTo && data.createdDateTo !== initialFormData.createdDateTo) filters.createdDateTo = data.createdDateTo;
    if (data.shiftType.length > 0) filters.shiftType = [...data.shiftType];
    if (data.nightShift !== "all") filters.nightShift = data.nightShift === "true";
    if (data.status !== null) filters.status = data.status;
    return filters;
  };

  const handleRemoveFilter = (key: string, value?: string) => {
    const nextFormData = { ...formDataRef.current };
    if (key === "shiftType" && value !== undefined) nextFormData.shiftType = nextFormData.shiftType.filter((type) => type !== value);
    else if (key === "searchText") nextFormData.searchText = "";
    else if (key === "createdDateFrom") nextFormData.createdDateFrom = initialFormData.createdDateFrom;
    else if (key === "createdDateTo") nextFormData.createdDateTo = initialFormData.createdDateTo;
    else if (key === "nightShift") nextFormData.nightShift = "all";
    else if (key === "status") nextFormData.status = null;
    formDataRef.current = nextFormData;
    setFormData(nextFormData);  
    const nextFilters = buildFilters(nextFormData);
    onFiltersChange?.(nextFilters, handleRemoveFilter);
    onSearch(nextFilters);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    const today = getDate();
    if ((name === "createdDateFrom" || name === "createdDateTo") && value && /^\d{4}-\d{2}-\d{2}$/.test(value) && value > today) return;
    const nextFormData = { ...formData, [name]: value };
    formDataRef.current = nextFormData;
    setFormData(nextFormData);
    onFiltersChange?.(buildFilters(nextFormData), handleRemoveFilter);
   
  };

  const handleDateChange = (name: "createdDateFrom" | "createdDateTo", value: Dayjs | null) => {
    const dateValue = value && value.isValid() ? value.format("YYYY-MM-DD") : "";
    const today = getDate();
    if (dateValue && dateValue > today) return;
    const nextFormData = { ...formData, [name]: dateValue };
    formDataRef.current = nextFormData;
    setFormData(nextFormData);
    onFiltersChange?.(buildFilters(nextFormData), handleRemoveFilter);
  };

  const handleSearch = () => {
    if (formData.createdDateFrom && formData.createdDateTo && formData.createdDateFrom > formData.createdDateTo) {
      window.alert("From Date cannot be later than To Date.");
      return;
    }
    
    const searchData = buildFilters(formData);
    onFiltersChange?.(searchData, handleRemoveFilter);
    onSearch(searchData);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  const handleReset = () => {
    const resetData = { ...initialFormData, createdDateFrom: getDate(7), createdDateTo: getDate() };
    formDataRef.current = resetData;
    setFormData(resetData);
    onFiltersChange?.({}, handleRemoveFilter);
    setShowMoreFilters(false);
    onSearch({});
  };

  const handleClearSearch = () => {
    const nextFormData = { ...formData, searchText: "" };
    formDataRef.current = nextFormData;
    setFormData(nextFormData);
    onFiltersChange?.(buildFilters(nextFormData), handleRemoveFilter);
    searchInputRef.current?.focus();
  };
  
  const handleShiftTypeChange = (value: string | string[]) => {
    const nextFormData = { ...formData, shiftType: Array.isArray(value) ? value : value ? [value] : [] };
    formDataRef.current = nextFormData;
    setFormData(nextFormData);
    onFiltersChange?.(buildFilters(nextFormData), handleRemoveFilter);
  };

  const handleNightShiftChange = (value: string | string[]) => {
    const nextFormData = { ...formData, nightShift: String(Array.isArray(value) ? value[0] ?? "all" : value) };
    formDataRef.current = nextFormData;
    setFormData(nextFormData);
    onFiltersChange?.(buildFilters(nextFormData), handleRemoveFilter);
  };

  const handleStatusChange = (value: string | string[]) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    const nextFormData = { ...formData, status: selectedValue === "all" ? null : selectedValue === "true" };
    formDataRef.current = nextFormData;
    setFormData(nextFormData);
    onFiltersChange?.(buildFilters(nextFormData), handleRemoveFilter);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper className="dashboard-search-summary" elevation={1} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.2fr 1fr" }, gap: 2, alignItems: "start", width: "100%", p: 2, mb: 2, border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#ffffff" }}>
        <Card elevation={0} className="shift-search-card" sx={{ backgroundColor: "#ffffff !important" }}>
          <CardContent className="shift-search-card-content" sx={{ backgroundColor: "#ffffff !important" }}>
            <Box className="shift-search-header">
              <Typography variant="h6" className="shift-search-title">Search Filters</Typography>
            </Box>
            <Card elevation={0} className="shift-search-card" sx={{ backgroundColor: "#ffffff !important" }}>
              <CardContent className="shift-search-card-content" sx={{ backgroundColor: "#ffffff !important" }}>
                <Box className="shift-search-fields" sx={{ position: "relative" }} onKeyDown={handleKeyDown}>
                  <TextField label="Shift Code / Shift Name" name="searchText" value={formData.searchText} onChange={handleChange} inputRef={searchInputRef} endIcon={formData.searchText ? (
                    <IconButton size="small" onClick={handleClearSearch} aria-label="Clear search">
                      <CloseIcon sx={{ color: "#041321" }} />
                    </IconButton>
                  ) : (
                    <SearchIcon onClick={() => searchInputRef.current?.focus()} sx={{ color: "#f8fcff", bgcolor: "#01070c", borderRadius: "50%", padding: "3px", cursor: "pointer" }} />
                  )} />
                 
                  <Box className="shift-search-date-field">
                    <Typography className="shift-search-date-label">From Date</Typography>
                    <DatePicker value={formData.createdDateFrom ? dayjs(formData.createdDateFrom) : null} onChange={(value) => handleDateChange("createdDateFrom", value)} maxDate={dayjs(getDate())} format="DD-MM-YYYY" slotProps={{ actionBar: { actions: ["today"] }, textField: { size: "small", fullWidth: true } }} />
                  </Box>
                  <Box className="shift-search-date-field">
                    <Typography className="shift-search-date-label">To Date</Typography>
                    <DatePicker value={formData.createdDateTo ? dayjs(formData.createdDateTo) : null} onChange={(value) => handleDateChange("createdDateTo", value)} maxDate={dayjs(getDate())} format="DD-MM-YYYY" slotProps={{ actionBar: { actions: ["today"] }, textField: { size: "small", fullWidth: true } }} />
                  </Box>
                </Box>
                {showMoreFilters && (
                  <Box className="shift-search-more-filters" onKeyDown={handleKeyDown}>
                    <MultiselectAutoComplete label="Shift Type" name="shiftType" value={formData.shiftType} multiple options={[
                      { label: "General", value: "General" },
                      { label: "Morning", value: "Morning" },
                      { label: "Evening", value: "Evening" },
                      { label: "Night", value: "Night" },
                      { label: "Rotational", value: "Rotational" },
                    ]} onChange={handleShiftTypeChange} />
                    <Box className="shift-search-options" sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      <Box sx={{ width: 130, maxWidth: "50%" }}>
                        <MultiselectAutoComplete label="Night Shift" name="nightShift" value={formData.nightShift} multiple={false} disableClearable options={[
                          { label: "All", value: "all" },
                          { label: "Yes", value: "true" },
                          { label: "No", value: "false" },
                        ]} onChange={handleNightShiftChange} />
                      </Box>
                      <Box sx={{ width: 120, maxWidth: "50%" }}>
                        <MultiselectAutoComplete label="Status" name="status" value={formData.status === null ? "all" : formData.status ? "true" : "false"} multiple={false} disableClearable options={[
                          { label: "All", value: "all" },
                          { label: "Active", value: "true" },
                          { label: "Inactive", value: "false" },
                        ]} onChange={handleStatusChange} />
                      </Box>
                    </Box>
                  </Box>
                )}
                <Box className="shift-search-actions">
                  <Button variant="contained" onClick={handleSearch} className="shift-search-button">Search</Button>
                  <Box className="shift-search-more-filter-button">
                    <Button variant="text" startIcon={<FilterListIcon />} onClick={() => setShowMoreFilters((previous) => !previous)}>{showMoreFilters ? "Hide Filters" : "More Filters"}</Button>
                  </Box>
                  <Button type="button" variant="contained" size="small" onClick={handleReset} sx={{ backgroundColor: "#eab308", color: "#111827", "&:hover": { backgroundColor: "#ca8a04" }, fontSize: "0.7rem", minWidth: "auto", padding: "6px 12px" }}>Reset</Button>
                </Box>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
        <Grid container spacing={1} sx={{ marginBottom: 3 }}>
          {[
            { title: "Total Shifts", value: totalShifts, icon: <AccessTimeIcon />, className: "summary-total", filter: "all" as const },
            { title: "Active Shifts", value: activeShifts, icon: <CheckCircleIcon />, className: "summary-active", filter: "active" as const },
            { title: "Inactive Shifts", value: inactiveShifts, icon: <CancelIcon />, className: "summary-inactive", filter: "inactive" as const },
            { title: "Night Shifts", value: nightShifts, icon: <NightlightIcon />, className: "summary-night", filter: "night" as const },
          ].map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 6 }} key={card.title}>
              <Card elevation={0} className={`summary-card ${card.className}`} onClick={() => onSummaryClick(card.filter)} sx={{ cursor: "pointer" }}>
                <CardContent>
                  <Box className="summary-card-content">
                    <Box>
                      <Typography variant="body2" className="summary-card-title">{card.title}</Typography>
                      <Typography variant="h4" className="summary-card-value">{card.value}</Typography>
                    </Box>
                    <Box className="summary-card-icon">{card.icon}</Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </LocalizationProvider>
  );
}
export default ShiftSearchForm;