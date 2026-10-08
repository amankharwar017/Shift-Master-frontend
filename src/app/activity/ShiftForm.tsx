import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Box, Button, Divider, Paper, Typography } from "@mui/material";
import TextField from "../../components/TextField";
import TextArea from "../../components/TextArea";
import DropDown from "../../components/DropDown";
import MultiselectAutoComplete from "../../components/MultiselectAutoComplete";
import CheckBox from "../../components/CheckBox";
import Attachment from "../../components/Attachment";
import RadioButton from "../../components/RadioButton";
import { saveShift, getShiftById, updateShift } from "./shiftApi";
import { shiftValidationSchema } from "../../shiftValidation/ShiftValidation";
import type { ShiftFormData } from "../../types/shift";

interface ShiftFormProps {
  editShiftId: number | null;
  onSuccess: (message: string) => void;
  onBack: () => void;
}

const initialFormData: ShiftFormData = {
  shiftCode: "",
  shiftName: "",
  displayName: "",
  shiftType: "General",
  startTime: "",
  endTime: "",
  breakStart: "",
  breakEnd: "",
  graceIn: null,
  graceOut: null,
  overtimeAllowed: false,
  nightShift: false,
  weeklyOff: false,
  shiftColor: "#000000",
  applicableDays: [],
  description: "",
  attachment: "",
  remarks: "",
  status: true,
};

const shiftTypeOptions = [
  { label: "General", value: "General" },
  { label: "Morning", value: "Morning" },
  { label: "Evening", value: "Evening" },
  { label: "Night", value: "Night" },
  { label: "Rotational", value: "Rotational" },
];

const dayOptions = [
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
  { label: "Sunday", value: "Sunday" },
];

function ShiftForm({ editShiftId, onSuccess, onBack }: ShiftFormProps) {
  const [formData, setFormData] = useState<ShiftFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleNumberChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value === "" ? null : Number(value),
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleCheckBoxChange = (
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    const { name } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: checked,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);

    setFormData((previous) => ({
      ...previous,
      attachment: file?.name ?? "",
    }));

    setErrors((previous) => ({
      ...previous,
      attachment: "",
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setErrors({});

    try {
      await shiftValidationSchema.validate(formData, {
        abortEarly: false,
      });

      const payload = {
        shiftCode: formData.shiftCode,
        shiftName: formData.shiftName,
        displayName: formData.displayName || null,
        shiftType: formData.shiftType,
        startTime: formData.startTime,
        endTime: formData.endTime,
        breakStart: formData.breakStart || null,
        breakEnd: formData.breakEnd || null,
        graceIn: formData.graceIn,
        graceOut: formData.graceOut,
        overtimeAllowed: formData.overtimeAllowed,
        nightShift: formData.nightShift,
        weeklyOff: formData.weeklyOff,
        shiftColor: formData.shiftColor || null,
        applicableDays: formData.applicableDays.map((day) =>
          day.toUpperCase()
        ),
        description: formData.description || null,
        attachment: formData.attachment || null,
        remarks: formData.remarks || null,
        status: formData.status,
      };

      if (editShiftId !== null) {
        const response = await updateShift(editShiftId, payload);

        setMessage(
          response.data?.message ?? "Shift updated successfully."
        );

        onSuccess(
          response.data?.message ?? "Shift updated successfully."
        );
      } else {
        const response = await saveShift(payload);

        const successMessage =
          response.data?.message ?? "Shift saved successfully.";

        setMessage(successMessage);
        onSuccess(successMessage);
      }

      setFormData(initialFormData);
      setSelectedFile(null);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "ValidationError") {
        const validationErrors: Record<string, string> = {};
        const yupError = error as {
          inner?: Array<{
            path?: string;
            message: string;
          }>;
        };

        yupError.inner?.forEach((item) => {
          if (item.path && !validationErrors[item.path]) {
            validationErrors[item.path] = item.message;
          }
        });

        setErrors(validationErrors);
        return;
      }

      const axiosError = error as {
        response?: {
          data?: {
            message?: string;
            error?: Record<string, string>;
          };
        };
      };

      const backendMessage = axiosError.response?.data?.message;

      setMessage(backendMessage ?? "Failed to save shift.");
    }
  };

  useEffect(() => {
    const fetchShiftForEdit = async () => {
      if (editShiftId === null) {
        setFormData(initialFormData);
        setSelectedFile(null);
        setErrors({});
        setMessage("");
        return;
      }

      try {
        const response = await getShiftById(editShiftId);
        const shift = response.data;

        setFormData({
          shiftCode: shift.shiftCode ?? "",
          shiftName: shift.shiftName ?? "",
          displayName: shift.displayName ?? "",
          shiftType: shift.shiftType ?? "General",
          startTime: shift.startTime ?? "",
          endTime: shift.endTime ?? "",
          breakStart: shift.breakStart ?? "",
          breakEnd: shift.breakEnd ?? "",
          graceIn: shift.graceIn ?? null,
          graceOut: shift.graceOut ?? null,
          overtimeAllowed: shift.overtimeAllowed ?? false,
          nightShift: shift.nightShift ?? false,
          weeklyOff: shift.weeklyOff ?? false,
          shiftColor: shift.shiftColor ?? "#000000",
          applicableDays: shift.applicableDays ?? [],
          description: shift.description ?? "",
          attachment: shift.attachment ?? "",
          remarks: shift.remarks ?? "",
          status: shift.status ?? true,
        });
      } catch (error) {
        console.error("failed to fetch data for edit: ", error);
      }
    };

    fetchShiftForEdit();
  }, [editShiftId]);

  return (
    <Paper elevation={0} className="shift-form-card">
      <form onSubmit={handleSubmit} noValidate>
        <Box className="shift-form-header">
          <Typography variant="h6" className="shift-form-title">
            Shift Details
          </Typography>

          <Typography variant="body2" className="shift-form-subtitle">
            Create and manage shift details
          </Typography>
        </Box>

        <Divider className="shift-form-divider" />

        <Box className="shift-form-fields">
          <TextField
            label="Shift Code"
            name="shiftCode"
            value={formData.shiftCode}
            onChange={handleChange}
            required
            error={Boolean(errors.shiftCode)}
            helperText={errors.shiftCode}
          />

          <TextField
            label="Shift Name"
            name="shiftName"
            value={formData.shiftName}
            onChange={handleChange}
            required
            error={Boolean(errors.shiftName)}
            helperText={errors.shiftName}
          />

          <TextField
            label="Display Name"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            error={Boolean(errors.displayName)}
            helperText={errors.displayName}
          />

          <DropDown
            label="Shift Type"
            name="shiftType"
            value={formData.shiftType}
            options={shiftTypeOptions}
            onChange={(event) =>
              setFormData((previous) => ({
                ...previous,
                shiftType: String(event.target.value),
              }))
            }
            required
            error={Boolean(errors.shiftType)}
            helperText={errors.shiftType}
          />

          <TextField
            label="Start Time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            type="time"
            required
            error={Boolean(errors.startTime)}
            helperText={errors.startTime}
          />

          <TextField
            label="End Time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            type="time"
            required
            error={Boolean(errors.endTime)}
            helperText={errors.endTime}
          />

          <TextField
            label="Break Start"
            name="breakStart"
            value={formData.breakStart}
            onChange={handleChange}
            type="time"
            error={Boolean(errors.breakStart)}
            helperText={errors.breakStart}
          />

          <TextField
            label="Break End"
            name="breakEnd"
            value={formData.breakEnd}
            onChange={handleChange}
            type="time"
            error={Boolean(errors.breakEnd)}
            helperText={errors.breakEnd}
          />

          <TextField
            label="Grace In"
            name="graceIn"
            value={
              formData.graceIn === null
                ? ""
                : String(formData.graceIn)
            }
            onChange={handleNumberChange}
            type="number"
            error={Boolean(errors.graceIn)}
            helperText={errors.graceIn}
          />

          <TextField
            label="Grace Out"
            name="graceOut"
            value={
              formData.graceOut === null
                ? ""
                : String(formData.graceOut)
            }
            onChange={handleNumberChange}
            type="number"
            error={Boolean(errors.graceOut)}
            helperText={errors.graceOut}
          />

          <TextField
            label="Shift Color"
            name="shiftColor"
            value={formData.shiftColor}
            onChange={handleChange}
            error={Boolean(errors.shiftColor)}
            helperText={errors.shiftColor}
          />

          <MultiselectAutoComplete
            label="Applicable Days"
            name="applicableDays"
            value={formData.applicableDays}
            options={dayOptions}
            onChange={(value) =>
              setFormData((previous) => ({
                ...previous,
                applicableDays: value,
              }))
            }
            error={Boolean(errors.applicableDays)}
            helperText={errors.applicableDays}
          />
        </Box>

        <Box className="shift-form-checkboxes">
          <CheckBox
            label="Overtime Allowed"
            name="overtimeAllowed"
            checked={formData.overtimeAllowed}
            onChange={handleCheckBoxChange}
          />

          <CheckBox
            label="Night Shift"
            name="nightShift"
            checked={formData.nightShift}
            onChange={handleCheckBoxChange}
          />

          <CheckBox
            label="Weekly Off"
            name="weeklyOff"
            checked={formData.weeklyOff}
            onChange={handleCheckBoxChange}
          />
        </Box>

        <Box className="shift-form-textareas">
          <TextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={Boolean(errors.description)}
            helperText={errors.description}
            minRows={4}
          />

          <TextArea
            label="Remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            error={Boolean(errors.remarks)}
            helperText={errors.remarks}
            minRows={4}
          />
        </Box>

        <Box className="shift-form-attachment">
          <Attachment
            label="Choose Attachment"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />

          {selectedFile && (
            <Typography
              variant="body2"
              className="shift-form-selected-file"
            >
              Selected file: {selectedFile.name}
            </Typography>
          )}

          {errors.attachment && (
            <Typography
              variant="caption"
              className="shift-form-attachment-error"
            >
              {errors.attachment}
            </Typography>
          )}
        </Box>

        <Box className="shift-form-status">
          <RadioButton
            label="Shift Status"
            name="status"
            value={formData.status ? "true" : "false"}
            options={[
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" },
            ]}
            onChange={(_, value) =>
              setFormData((previous) => ({
                ...previous,
                status: value === "true",
              }))
            }
            row
          />
        </Box>

        {message && (
          <Box
            className={`shift-form-message ${
              message.toLowerCase().includes("failed")
                ? "shift-form-message-error"
                : "shift-form-message-success"
            }`}
          >
            <Typography variant="body2">{message}</Typography>
          </Box>
        )}

        <Box className="shift-form-actions">
          <Button
            type="button"
            variant="outlined"
            onClick={onBack}
            className="shift-form-back-button"
          >
            Back
          </Button>

          <Button
            type="submit"
            variant="contained"
            className="shift-form-submit-button"
          >
            {editShiftId !== null ? "Update Shift" : "Save Shift"}
          </Button>
        </Box>
      </form>
    </Paper>
  );
}

export default ShiftForm;