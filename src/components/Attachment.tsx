import {
  Box,
  Button,
  Typography,
} from "@mui/material";

interface AttachmentProps {
  label: string;
  accept?: string;
  onChange: (file: File | null) => void;
}

function Attachment({
  label,
  accept = ".pdf,.doc,.docx",
  onChange,
}: AttachmentProps) {
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0] ?? null;

    onChange(file);

    event.target.value = "";
  };

  return (
    <Box className="custom-attachment">
      <Button
        variant="outlined"
        component="label"
        className="custom-attachment-button"
      >
        {label}

        <input
          hidden
          type="file"
          accept={accept}
          onChange={handleChange}
        />
      </Button>

      <Typography
        variant="caption"
        className="custom-attachment-text"
      >
        Allowed files: PDF, DOC, DOCX
      </Typography>
    </Box>
  );
}

export default Attachment;