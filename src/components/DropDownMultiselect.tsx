import { Checkbox, FormControl, FormHelperText, InputLabel, ListItemText, MenuItem, Select, type SelectChangeEvent } from "@mui/material";

interface DropDownOption {
  label: string;
  value: string;
}

interface DropDownMultiselectProps {
  label: string;
  name: string;
  value: string | string[];
  options: DropDownOption[];
  onChange: (event: SelectChangeEvent<string | string[]>) => void;
  multiple?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

function DropDownMultiselect({ label, name, value, options, onChange, multiple = false, required = false, error = false, helperText = "" }: DropDownMultiselectProps) {
  const labelId = `${name}-label`;

  return (
    <FormControl fullWidth required={required} error={error} className="custom-dropdown">
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select labelId={labelId} id={name} name={name} value={value} label={label} multiple={multiple} onChange={onChange} renderValue={(selected) => Array.isArray(selected) ? selected.map((item) => options.find((option) => option.value === item)?.label ?? item).join(", ") : options.find((option) => option.value === selected)?.label ?? selected}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value} className="custom-dropdown-menu-item">
            {multiple && <Checkbox checked={Array.isArray(value) && value.includes(option.value)} />}
            {multiple ? <ListItemText primary={option.label} /> : option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

export default DropDownMultiselect;