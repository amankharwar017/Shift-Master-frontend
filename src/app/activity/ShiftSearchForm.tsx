
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Box, Button, Card, CardContent, Divider, IconButton, Paper, Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TextField from "../../components/TextField";
import DropDownMultiselect from "../../components/DropDownMultiselect";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { getShiftList } from "./shiftApi";

interface ShiftSearchFormProps {
  onSearch: (searchData: Record<string, any>) => void;
}

function ShiftSearchForm({ onSearch }: ShiftSearchFormProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fromDateRef = useRef<HTMLInputElement>(null);
  const toDateRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [shiftNames, setShiftNames] = useState<string[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

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
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  useEffect(() => {
    const fetchShiftNames = async () => {
      try {
        const names: string[] = [];
        let page = 0;
        let totalPages = 1;

        while (page < totalPages) {
          const response = await getShiftList(page, 100, "id,asc");
          const shifts = response.data?.content ?? [];
          names.push(...shifts.map((shift: { shiftName?: string }) => shift.shiftName).filter((name: string | undefined): name is string => Boolean(name)));
          totalPages = response.data?.totalPages ?? 1;
          page++;
        }

        setShiftNames([...new Set(names)]);
      } catch (error) {
        console.error("Failed to fetch shift names:", error);
      }
    };

    fetchShiftNames();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!searchInputRef.current?.contains(target) && !suggestionsRef.current?.contains(target)) {
        setSuggestionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (name === "searchText") setSuggestionsOpen(Boolean(value.trim()));
  };

  const handleSearch = () => {
    const searchData: Record<string, any> = {};

    if (formData.searchText.trim()) searchData.searchText = formData.searchText.trim();
    if (formData.createdDateFrom) searchData.createdDateFrom = formData.createdDateFrom;
    if (formData.createdDateTo) searchData.createdDateTo = formData.createdDateTo;

    if (showMoreFilters) {
      if (formData.shiftType.length > 0) searchData.shiftType = formData.shiftType;
      if (formData.nightShift !== "all") searchData.nightShift = formData.nightShift === "true";
      if (formData.status !== null) searchData.status = formData.status;
    }

    setSuggestionsOpen(false);
    onSearch(searchData);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  const handleReset = () => {
    setFormData({ ...initialFormData, createdDateFrom: getDate(7), createdDateTo: getDate() });
    setShowMoreFilters(false);
    setSuggestionsOpen(false);
    onSearch({});
  };

  const handleClearSearch = () => {
    setFormData((previous) => ({ ...previous, searchText: "" }));
    setSuggestionsOpen(false);
    searchInputRef.current?.focus();
  };

  const filteredShiftNames = shiftNames.filter((name) => name.toLowerCase().includes(formData.searchText.trim().toLowerCase()));

  const handleSelectShift = (shiftName: string) => {
    setFormData((previous) => ({ ...previous, searchText: shiftName }));
    setSuggestionsOpen(false);
    searchInputRef.current?.focus();
  };

  return (
    <Card elevation={0} className="shift-search-card">
      <CardContent className="shift-search-card-content">
        <Box className="shift-search-header">
          <Typography variant="h6" className="shift-search-title">Search Filters</Typography>
          <Typography variant="body2" className="shift-search-subtitle">Search shifts using the available filters.</Typography>
        </Box>
        <Divider className="shift-search-divider" />
        <Box className="shift-search-fields" sx={{ position: "relative" }}>
          <TextField
            label="Shift Code / Shift Name"
            name="searchText"
            value={formData.searchText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            inputRef={searchInputRef}
            endIcon={formData.searchText ? (
              <IconButton size="small" onClick={handleClearSearch} aria-label="Clear search">
                <CloseIcon sx={{ color: "#1976d2" }} />
              </IconButton>
            ) : (
              <SearchIcon onClick={() => searchInputRef.current?.focus()} sx={{ color: "#1976d2", cursor: "pointer" }} />
            )}
          />
          {suggestionsOpen && formData.searchText.trim() && filteredShiftNames.length > 0 && (
            <Paper ref={suggestionsRef} elevation={4} sx={{ position: "absolute", top: 40, left: 0, width: "100%", zIndex: 1300, maxHeight: 220, overflowY: "auto" }}>
              {filteredShiftNames.map((shiftName) => (
                <Box key={shiftName} onMouseDown={(event) => event.preventDefault()} onClick={() => handleSelectShift(shiftName)} sx={{ px: 2, py: 1, cursor: "pointer", "&:hover": { backgroundColor: "action.hover" } }}>
                  <Typography variant="body2">{shiftName}</Typography>
                </Box>
              ))}
            </Paper>
          )}
          <Box className="shift-search-date-field">
            <Typography className="shift-search-date-label">From Date</Typography>
            <Box className="shift-date-picker-wrapper">
              <TextField label="" name="createdDateFrom" value={formData.createdDateFrom} onChange={handleChange} type="text" placeholder="YYYY-MM-DD" endIcon={<IconButton size="small" onClick={() => fromDateRef.current?.showPicker()}><CalendarMonthIcon fontSize="small" /></IconButton>} />
              <input ref={fromDateRef} type="date" value={formData.createdDateFrom} onChange={(event) => setFormData((previous) => ({ ...previous, createdDateFrom: event.target.value }))} className="hidden-date-picker" />
            </Box>
          </Box>
          <Box className="shift-search-date-field">
            <Typography className="shift-search-date-label">To Date</Typography>
            <Box className="shift-date-picker-wrapper">
              <TextField label="" name="createdDateTo" value={formData.createdDateTo} onChange={handleChange} type="text" placeholder="YYYY-MM-DD" endIcon={<IconButton size="small" onClick={() => toDateRef.current?.showPicker()}><CalendarMonthIcon fontSize="small" /></IconButton>} />
              <input ref={toDateRef} type="date" value={formData.createdDateTo} onChange={(event) => setFormData((previous) => ({ ...previous, createdDateTo: event.target.value }))} className="hidden-date-picker" />
            </Box>
          </Box>
        </Box>
        {showMoreFilters && (
          <Box className="shift-search-more-filters">
            <DropDownMultiselect label="Shift Type" name="shiftType" value={formData.shiftType} multiple options={[
              { label: "General", value: "General" },
              { label: "Morning", value: "Morning" },
              { label: "Evening", value: "Evening" },
              { label: "Night", value: "Night" },
              { label: "Rotational", value: "Rotational" },
            ]} onChange={(event) => setFormData((previous) => ({ ...previous, shiftType: typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value }))} />
            <Box className="shift-search-options">
              <DropDownMultiselect label="Night Shift" name="nightShift" value={formData.nightShift} options={[
                { label: "All", value: "all" },
                { label: "Yes", value: "true" },
                { label: "No", value: "false" },
              ]} onChange={(event) => setFormData((previous) => ({ ...previous, nightShift: String(event.target.value) }))} />
              <DropDownMultiselect label="Status" name="status" value={formData.status === null ? "all" : formData.status ? "true" : "false"} options={[
                { label: "All", value: "all" },
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" },
              ]} onChange={(event) => setFormData((previous) => ({ ...previous, status: event.target.value === "all" ? null : event.target.value === "true" }))} />
            </Box>
          </Box>
        )}
        <Box className="shift-search-actions">
          <Button variant="contained" onClick={handleSearch} className="shift-search-button">Search</Button>
          <Box className="shift-search-more-filter-button">
            <Button variant="text" startIcon={<FilterListIcon />} onClick={() => setShowMoreFilters((previous) => !previous)}>
              {showMoreFilters ? "Hide Filters" : "More Filters"}
            </Button>
          </Box>
          <Button variant="outlined" onClick={handleReset} className="shift-search-reset-button">Reset</Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default ShiftSearchForm;
