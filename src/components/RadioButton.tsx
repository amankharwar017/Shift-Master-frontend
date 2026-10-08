import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup,} from "@mui/material";

interface RadioOption {
  label: string;
  value: string;
}

interface RadioButtonProps {
  label: string;
  name: string;
  value: string;
  options: RadioOption[];
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string
  ) => void;
  row?: boolean;
}

function RadioButton({
  label,
  name,
  value,
  options,
  onChange,
  row = false,
}: RadioButtonProps) {
  return (
    <FormControl className="custom-radio-button">
      <FormLabel>{label}</FormLabel>

      <RadioGroup
        row={row}
        name={name}
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

export default RadioButton;