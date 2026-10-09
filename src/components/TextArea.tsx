import { TextField, type TextFieldProps } from "@mui/material";

interface TextAreaProps extends Omit<TextFieldProps, "variant"> {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  minRows?: number;
}

function TextArea({ label, name, value, onChange, minRows = 4, ...props }: TextAreaProps) {
  return (
    <TextField
      fullWidth
      multiline
      minRows={minRows}
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      variant="outlined"
      className="custom-text-area"
      {...props}
    />
  );
}

export default TextArea;