import {Autocomplete,TextField,} from "@mui/material";

interface AutoCompleteOption {
  label: string;
  value: string;
}

interface AutoCompleteProps {
  label: string;
  value: AutoCompleteOption | null;
  options: AutoCompleteOption[];
  onChange: (
    value: AutoCompleteOption | null
  ) => void;
}

function AutoComplete({
  label,
  value,
  options,
  onChange,
}: AutoCompleteProps) {
  return (
    <Autocomplete
      fullWidth
      options={options}
      value={value}
      getOptionLabel={(option) =>option.label}
      onChange={(_, newValue) =>onChange(newValue)}
      className="custom-autocomplete"
      renderInput={(params) => (
        <TextField {...params} label={label} />
      )}
    />
  );
}

export default AutoComplete;