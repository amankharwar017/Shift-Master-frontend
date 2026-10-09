import { TextField as MuiTextField, InputAdornment, type TextFieldProps as MuiTextFieldProps } from "@mui/material";
import type { ReactNode } from "react";

interface TextFieldProps extends Omit<MuiTextFieldProps, "variant" | "onChange"> {
  label: string;
  name: string;
  value: string;
  onChange: MuiTextFieldProps["onChange"];
  endIcon?: ReactNode;
  inputRef?: MuiTextFieldProps["inputRef"];
}

function TextField({ label, name, value, onChange, endIcon, inputRef, ...props }: TextFieldProps) {
  return (
    <MuiTextField
      fullWidth
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      variant="outlined"
      className="custom-text-field"
      inputRef={inputRef}
      slotProps={{
        input: {
          endAdornment: endIcon ? <InputAdornment position="end">{endIcon}</InputAdornment> : undefined,
        },
      }}
      {...props}
    />
  );
}

export default TextField;