import {TextField as MuiTextField , type TextFieldProps as MuiTextFieldProps,} from "@mui/material";

interface TextFieldProps
  extends Omit<MuiTextFieldProps, "variant" | "onChange"> {
  label: string;
  name: string;
  value: string;
  onChange: MuiTextFieldProps["onChange"];
}

function TextField({
  label,
  name,
  value,
  onChange,
  ...props
}: TextFieldProps) {
  return (
    <MuiTextField
      fullWidth
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      variant="outlined"
      className="custom-text-field"
      {...props}
    />
  );
}

export default TextField;