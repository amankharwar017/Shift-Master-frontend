import { Autocomplete, Checkbox, FormControl, FormHelperText, TextField } from "@mui/material";
interface MultiselectAutoCompleteOption {
  label: string;
  value: string;
}
interface MultiselectAutoCompleteProps {
  label: string;
  name: string;
  value: string | string[];
  options: MultiselectAutoCompleteOption[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  disableClearable?: boolean;
  size?: "small" | "medium";
}
function MultiselectAutoComplete({ label, name, value, options, onChange, multiple = false, required = false, error = false, helperText = "", disableClearable = false, size = "small" }: MultiselectAutoCompleteProps) {
  const selectedOptions = multiple
    ? options.filter((option) => Array.isArray(value) && value.includes(option.value))
    : options.find((option) => !Array.isArray(value) && option.value === value) ?? null;
  return (
    <FormControl fullWidth required={required} error={error} className="custom-multiselect-autocomplete">
      <Autocomplete<MultiselectAutoCompleteOption, boolean, boolean, false>
        multiple={multiple}
        fullWidth
        openOnFocus
        options={options}
        value={selectedOptions}
        disableCloseOnSelect={multiple}
        disableClearable={disableClearable}
        size={size}
        filterSelectedOptions={false}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, selectedOption) => option.value === selectedOption.value}
        onChange={(_, newValue) => {
          if (multiple) {
            onChange(Array.isArray(newValue) ? newValue.map((option) => option.value) : []);
          } else {
            onChange(Array.isArray(newValue) ? newValue[0]?.value ?? "" : newValue?.value ?? "");
          }
        }}
        className="custom-multiselect-autocomplete-field"
        renderOption={(props, option, { selected }) => (
          <li {...props} key={option.value}>
            {multiple && <Checkbox checked={selected} className="custom-multiselect-autocomplete-checkbox" />}
            {option.label}
          </li>
        )}
        renderInput={(params) => <TextField {...params} label={label} name={name} required={required} error={error} size={size} />}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
export default MultiselectAutoComplete;
