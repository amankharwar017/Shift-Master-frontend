import {
  Autocomplete,
  Checkbox,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";

interface MultiselectAutoCompleteOption {
  label: string;
  value: string;
}

interface MultiselectAutoCompleteProps {
  label: string;
  name: string;
  value: string[];
  options: MultiselectAutoCompleteOption[];
  onChange: (value: string[]) => void;
  error?: boolean;
  helperText?: string;
}

function MultiselectAutoComplete({
  label,
  name,
  value,
  options,
  onChange,
  error = false,
  helperText = "",
}: MultiselectAutoCompleteProps) {
  const selectedOptions = options.filter((option) =>
    value.includes(option.value)
  );

  return (
    <FormControl
      fullWidth
      error={error}
      className="custom-multiselect-autocomplete"
    >
      <Autocomplete
        multiple
        fullWidth
        openOnFocus
        options={options}
        value={selectedOptions}
        disableCloseOnSelect
        filterSelectedOptions={false}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, selectedOption) =>
          option.value === selectedOption.value
        }
        onChange={(_, newValue) => {
          onChange(newValue.map((option) => option.value));
        }}
        className="custom-multiselect-autocomplete-field"
        renderOption={(props, option, { selected }) => (
          <li {...props} key={option.value}>
            <Checkbox
              checked={selected}
              className="custom-multiselect-autocomplete-checkbox"
            />
            {option.label}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            name={name}
            error={error}
          />
        )}
      />

      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
}

export default MultiselectAutoComplete;