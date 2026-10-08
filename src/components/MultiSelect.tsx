import { Checkbox, FormControl, FormHelperText, InputLabel, ListItemText, MenuItem, Select, type SelectChangeEvent, } from "@mui/material";

interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label: string;
  name: string;
  value: string[];
  options: MultiSelectOption[];
  onChange: (
    event: SelectChangeEvent<string[]>
  ) => void;
  error?: boolean;
  helperText?: string;
}

function MultiSelect({
  label,
  name,
  value,
  options,
  onChange,
  error = false,
  helperText = "",
}: MultiSelectProps) {
  const labelId = `${name}-label`;

  return (
    <FormControl
      fullWidth
      error={error}
      className="custom-multiselect"
    >
      <InputLabel id={labelId}> {label} </InputLabel>

      <Select
        labelId={labelId}
        id={name}
        name={name}
        multiple
        value={value}
        label={label}
        onChange={onChange}
        renderValue={(selected) => selected.join(", ")}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            className="custom-multiselect-menu-item"
          >
            <Checkbox checked={value.includes(option.value)} />
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>

      {helperText && (<FormHelperText> {helperText} </FormHelperText>)}
    </FormControl>
  );
}

export default MultiSelect;