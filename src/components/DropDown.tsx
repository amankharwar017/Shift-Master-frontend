import { FormControl, FormHelperText, InputLabel, MenuItem, Select, type SelectChangeEvent,} from "@mui/material";

interface DropDownOption {
  label: string;
  value: string;
}

interface DropDownProps {
  label: string;
  name: string;
  value: string;
  options: DropDownOption[];
  onChange: (event: SelectChangeEvent<string>) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

function DropDown({
  label,
  name,
  value,
  options,
  onChange,
  required = false,
  error = false,
  helperText = "",
}: DropDownProps) {
  const labelId = `${name}-label`;

  return (
    <FormControl fullWidth required={required} error={error} className="custom-dropdown" >
      <InputLabel id={labelId}> {label} </InputLabel>

      <Select
        labelId={labelId}
        id={name}
        name={name}
        value={value}
        label={label}
        onChange={onChange}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}  className="custom-dropdown-menu-item">
            {option.label}
          </MenuItem>
        ))}
      </Select>

      {helperText && ( <FormHelperText> {helperText} </FormHelperText> )}
    </FormControl>
  );
}

export default DropDown;