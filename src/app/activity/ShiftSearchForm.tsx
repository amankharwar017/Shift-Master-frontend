import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TextField from "../../components/TextField";
import DropDown from "../../components/DropDown";
import CheckBox from "../../components/CheckBox";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";

interface ShiftSearchFormProps {
  onSearch: (searchData: Record<string, any>) => void;
}

function ShiftSearchForm({ onSearch }: ShiftSearchFormProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fromDateRef = useRef<HTMLInputElement>(null);
  const toDateRef = useRef<HTMLInputElement>(null);

  const getDate = (daysAgo = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const initialFormData = {
    searchText: "",
    shiftType: "",
    nightShift: false,
    status: null as boolean | null,
    createdDateFrom: getDate(7),
    createdDateTo: getDate(),
  };

  const [formData, setFormData] = useState(initialFormData);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCheckBoxChange = (
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    const { name } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: checked,
    }));
  };

  const handleSearch = () => {
    const searchData: Record<string, any> = {};

    if (formData.searchText.trim()) {
      searchData.searchText = formData.searchText.trim();
    }

    if (formData.createdDateFrom) {
      searchData.createdDateFrom = formData.createdDateFrom;
    }

    if (formData.createdDateTo) {
      searchData.createdDateTo = formData.createdDateTo;
    }

    if (showMoreFilters) {
      if (formData.shiftType) {
        searchData.shiftType = formData.shiftType;
      }

      if (formData.nightShift) {
        searchData.nightShift = true;
      }

      if (formData.status !== null) {
        searchData.status = formData.status;
      }
    }

    onSearch(searchData);
  };

  const handleReset = () => {
    setFormData({
      ...initialFormData,
      createdDateFrom: getDate(7),
      createdDateTo: getDate(),
    });

    setShowMoreFilters(false);
  };

  return (
    <Card elevation={0} className="shift-search-card">
      <CardContent className="shift-search-card-content">
        <Box className="shift-search-header">
          <Typography variant="h6" className="shift-search-title">
            Search Filters
          </Typography>

          <Typography variant="body2" className="shift-search-subtitle">
            Search shifts using the available filters.
          </Typography>
        </Box>

        <Divider className="shift-search-divider" />

        <Box className="shift-search-fields">
          <TextField
            label="Shift Code / Shift Name"
            name="searchText"
            value={formData.searchText}
            onChange={handleChange}
            inputRef={searchInputRef}
            endIcon={
              <SearchIcon
                onClick={() => searchInputRef.current?.focus()}
                sx={{
                  color: "#1976d2",
                  cursor: "pointer",
                }}
              />
            }
          />

          <Box className="shift-search-date-field">
            <Typography className="shift-search-date-label">
              From Date
            </Typography>

            <Box className="shift-date-picker-wrapper">
              <TextField
                label=""
                name="createdDateFrom"
                value={formData.createdDateFrom}
                onChange={handleChange}
                type="text"
                placeholder="YYYY-MM-DD"
                endIcon={
                  <IconButton
                    size="small"
                    onClick={() => fromDateRef.current?.showPicker()}
                  >
                    <CalendarMonthIcon fontSize="small" />
                  </IconButton>
                }
              />

              <input
                ref={fromDateRef}
                type="date"
                value={formData.createdDateFrom}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    createdDateFrom: event.target.value,
                  }))
                }
                className="hidden-date-picker"
              />
            </Box>
          </Box>

          <Box className="shift-search-date-field">
            <Typography className="shift-search-date-label">
              To Date
            </Typography>

            <Box className="shift-date-picker-wrapper">
              <TextField
                label=""
                name="createdDateTo"
                value={formData.createdDateTo}
                onChange={handleChange}
                type="text"
                placeholder="YYYY-MM-DD"
                endIcon={
                  <IconButton
                    size="small"
                    onClick={() => toDateRef.current?.showPicker()}
                  >
                    <CalendarMonthIcon fontSize="small" />
                  </IconButton>
                }
              />

              <input
                ref={toDateRef}
                type="date"
                value={formData.createdDateTo}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    createdDateTo: event.target.value,
                  }))
                }
                className="hidden-date-picker"
              />
            </Box>
          </Box>
        </Box>

        {showMoreFilters && (
          <Box className="shift-search-more-filters">
            <DropDown
              label="Shift Type"
              name="shiftType"
              value={formData.shiftType}
              options={[
                { label: "General", value: "General" },
                { label: "Morning", value: "Morning" },
                { label: "Evening", value: "Evening" },
                { label: "Night", value: "Night" },
                { label: "Rotational", value: "Rotational" },
              ]}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  shiftType: String(event.target.value),
                }))
              }
            />

            <Box className="shift-search-options">
              <CheckBox
                label="Night Shift"
                name="nightShift"
                checked={formData.nightShift}
                onChange={handleCheckBoxChange}
              />

              <DropDown
                label="Status"
                name="status"
                value={
                  formData.status === null
                    ? "all"
                    : formData.status
                      ? "true"
                      : "false"
                }
                options={[
                  { label: "All", value: "all" },
                  { label: "Active", value: "true" },
                  { label: "Inactive", value: "false" },
                ]}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    status:
                      event.target.value === "all"
                        ? null
                        : event.target.value === "true",
                  }))
                }
              />
            </Box>
          </Box>
        )}

        <Box className="shift-search-actions">
          <Box className="shift-search-more-filter-button">
            <Button
              variant="text"
              startIcon={<FilterListIcon />}
              onClick={() =>
                setShowMoreFilters((previous) => !previous)
              }
            >
              {showMoreFilters ? "Hide Filters" : "More Filters"}
            </Button>
          </Box>

          <Button
            variant="outlined"
            onClick={handleReset}
            className="shift-search-reset-button"
          >
            Reset
          </Button>

          <Button
            variant="contained"
            onClick={handleSearch}
            className="shift-search-button"
          >
            Search
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default ShiftSearchForm;