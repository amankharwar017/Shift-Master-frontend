import { Autocomplete, Checkbox, TextField, } from "@mui/material";

interface MultiselectAutoCompleteOption {
  label: string;
  value: string;
}

interface MultiselectAutoCompleteProps {
  label: string;
  value: MultiselectAutoCompleteOption[];
  options: MultiselectAutoCompleteOption[];
  onChange: (
    value: MultiselectAutoCompleteOption[]
  ) => void;
}

function MultiselectAutoComplete({
  label,
  value,
  options,
  onChange,
}: MultiselectAutoCompleteProps) {
  return (
    <Autocomplete
      multiple
      fullWidth
      options={options}
      value={value}
      disableCloseOnSelect
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, selectedOption) => option.value === selectedOption.value}
      onChange={(_, newValue) => onChange(newValue)}
      className="custom-multiselect-autocomplete"
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            checked={selected}
            sx={{ marginRight: 1 }}
          />
          {option.label}
        </li>
      )}
      renderInput={(params) => (<TextField   {...params} label={label} />
      )}
    />
  );
}

export default MultiselectAutoComplete;