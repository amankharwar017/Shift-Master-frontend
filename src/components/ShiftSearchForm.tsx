import { useState } from "react";
import type { ChangeEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";
import TextField from "./TextField";
import DropDown from "./DropDown";
import CheckBox from "./CheckBox";
import RadioButton from "./RadioButton";
import FilterListIcon from "@mui/icons-material/FilterList";

interface ShiftSearchFormProps {
  onSearch: (searchData: Record<string, any>) => void;
}

function ShiftSearchForm({ onSearch }: ShiftSearchFormProps) {
  const initialFormData = {
    searchText: "",
    shiftType: "",
    nightShift: false,
    status: null as boolean | null,
    createdDateFrom: "",
    createdDateTo: "",
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
    setFormData(initialFormData);
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
          />

          <Box className="shift-search-date-field">
            <Typography className="shift-search-date-label">
              From Date
            </Typography>

            <TextField
              label=""
              name="createdDateFrom"
              value={formData.createdDateFrom}
              onChange={handleChange}
              type="date"
            />
          </Box>

          <Box className="shift-search-date-field">
            <Typography className="shift-search-date-label">
              To Date
            </Typography>

            <TextField
              label=""
              name="createdDateTo"
              value={formData.createdDateTo}
              onChange={handleChange}
              type="date"
            />
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

              <RadioButton
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
                onChange={(_, value) =>
                  setFormData((previous) => ({
                    ...previous,
                    status:
                      value === "all"
                        ? null
                        : value === "true",
                  }))
                }
                row
              />
            </Box>
          </Box>
        )}

        <Box className="shift-search-more-filter-button">
          <Button
            variant="text"
            startIcon = {<FilterListIcon/>}
            onClick={() =>
              setShowMoreFilters((previous) => !previous)
            }
          >
            {showMoreFilters ? "Hide Filters" : "More Filters"}
          </Button>
        </Box>

        <Box className="shift-search-actions">
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