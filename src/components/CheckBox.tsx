import { Checkbox, FormControlLabel } from "@mui/material";

interface CheckBoxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
}

function CheckBox({ label, name, checked, onChange }: CheckBoxProps) {
  return (
    <FormControlLabel
      className="custom-checkbox"
      control={<Checkbox name={name} checked={checked} onChange={onChange} /> }
      label={label}
    />
  );
}

export default CheckBox;
