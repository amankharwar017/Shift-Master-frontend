
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Box, Button, CardContent,Card, Paper, Typography } from "@mui/material";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import TextField from "../../components/TextField";
import TextArea from "../../components/TextArea";
import MultiselectAutoComplete from "../../components/MultiselectAutoComplete";
import Attachment from "../../components/Attachment";
import { getShiftById, updateShift } from "../shift-api";
import { shiftValidationSchema } from "../shift-validation";
import type { ShiftFormValues } from "../shift-validation";
import type { ShiftFormData } from "../../types/shift";

interface UpdateShiftFormProps {
  editShiftId: number;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
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

function UpdateShiftForm({ editShiftId, onSuccess, onError, onBack }: UpdateShiftFormProps) {
  const [formData, setFormData] = useState<ShiftFormData>(initialFormData);
  const [originalFormData, setOriginalFormData] = useState<ShiftFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const {
    handleSubmit: handleFormSubmit,
    reset,
    setValue,
    formState: { errors: formErrors },
  } = useForm<ShiftFormValues>({
    resolver: yupResolver(shiftValidationSchema),
    defaultValues: initialFormData,
  });
  const syncField = (name: keyof ShiftFormValues, value: unknown) => {
    setValue(name, value as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };
  const updateField = (name: keyof ShiftFormData, value: unknown) => {
    setFormData((previous) => ({ ...previous, [name]: value }));
    syncField(name as keyof ShiftFormValues, value);
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };
  const text = (label: string, name: keyof ShiftFormData, type = "text", required = false) => (
    <TextField label={label} name={name} value={String(formData[name] ?? "")} onChange={handleChange} type={type} required={required} error={Boolean(errors[name])} helperText={errors[name]} />
  );
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    updateField(name as keyof ShiftFormData, value);
  };
  const handleNumberChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    updateField(name as keyof ShiftFormData, value === "" ? null : Number(value));
  };
  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    updateField("attachment", file?.name ?? originalFormData?.attachment ?? "");
  };
  const hasFormChanged = () => {
    if (originalFormData === null) return true;
    const normalizeData = (data: ShiftFormData) => ({
      ...data,
      applicableDays: [...data.applicableDays].sort(),
    });
    return (
      JSON.stringify(normalizeData(formData)) !== JSON.stringify(normalizeData(originalFormData)) ||
      selectedFile !== null
    );
  };
  const submitValidForm = async () => {
    setErrors({});
    if (!hasFormChanged()) {
      onSuccess("No changes detected.");
      return;
    }
    try {
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
        applicableDays: formData.applicableDays.map((day) => day.toUpperCase()),
        description: formData.description || null,
        attachment: formData.attachment || null,
        remarks: formData.remarks || null,
        status: formData.status,
      };
      const response = await updateShift(editShiftId, payload);
      onSuccess(response.data?.message ?? "Shift updated successfully.");
      setFormData(initialFormData);
      reset(initialFormData);
      setOriginalFormData(null);
      setSelectedFile(null);
      setErrors({});
    } catch (error: unknown) {
      console.error("Update error:", error);
      const axiosError = error as {
        response?: {
          data?: {
            message?: string;
            error?: Record<string, string>;
          };
        };
      };
      const backendErrors = axiosError.response?.data?.error;
      if (backendErrors) setErrors(backendErrors);
      onError(axiosError.response?.data?.message ?? "Failed to update shift.");
    }
  };
  const handleInvalidForm = (validationErrors: typeof formErrors) => {
    const mappedErrors: Record<string, string> = {};
    Object.entries(validationErrors).forEach(([field, error]) => {
      if (error?.message) {
        mappedErrors[field] = String(error.message);
      }
    });
    setErrors(mappedErrors);
  };
  useEffect(() => {
    const fetchShiftForEdit = async () => {
      setErrors({});
      setSelectedFile(null);
      try {
        const response = await getShiftById(editShiftId);
        const shift = response.data;
        const shiftData: ShiftFormData = {
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
        };
        setFormData(shiftData);
        reset(shiftData);
        setOriginalFormData(shiftData);
        setSelectedFile(null);
        setErrors({});
      } catch (error) {
        console.error("Failed to fetch data for edit:", error);
        onError("Failed to load shift details.");
      }
    };
    fetchShiftForEdit();
  }, [editShiftId, reset]);
  return (
    <Paper elevation={0} className="shift-form-card">
      <form onSubmit={handleFormSubmit(submitValidForm, handleInvalidForm)} noValidate>
        <Box className="shift-form-header" sx={{backgroundColor: "#000000", color: "#ffffff", padding: "16px 20px",}}>
          <Box className="shift-form-heading-icon">
            <AddBoxOutlinedIcon/>
          </Box>
          <Box className="shift-form-heading-text" sx={{ color: "#ffffff" }}>
            <Typography variant="h6" >Update Shift</Typography>           
          </Box>
        </Box>
        <Card elevation={0} className="shift-search-card" sx={{ backgroundColor: "#ffffff !important" }}>
          <CardContent className="shift-search-card-content" sx={{ backgroundColor: "#ffffff !important" }}>
            <Box className="shift-form-fields">
              {text("Shift Code", "shiftCode", "text", true)}
              {text("Shift Name", "shiftName", "text", true)}
              {text("Display Name", "displayName")}
              <MultiselectAutoComplete label="Shift Type" name="shiftType" value={formData.shiftType} options={shiftTypeOptions} multiple={false} onChange={(value) => updateField("shiftType", Array.isArray(value) ? value[0] ?? "" : value)} required error={Boolean(errors.shiftType)} helperText={errors.shiftType} />
              {text("Start Time", "startTime", "time", true)}
              {text("End Time", "endTime", "time", true)}
              {text("Break Start", "breakStart", "time")}
              {text("Break End", "breakEnd", "time")}
              <TextField label="Grace In" name="graceIn" value={formData.graceIn === null ? "" : String(formData.graceIn)} onChange={handleNumberChange} type="number" error={Boolean(errors.graceIn)} helperText={errors.graceIn} />
              <TextField label="Grace Out" name="graceOut" value={formData.graceOut === null ? "" : String(formData.graceOut)} onChange={handleNumberChange} type="number" error={Boolean(errors.graceOut)} helperText={errors.graceOut} />
              {text("Shift Color", "shiftColor")}
              <MultiselectAutoComplete label="Applicable Days" name="applicableDays" value={formData.applicableDays} options={dayOptions} multiple={true} onChange={(value) => updateField("applicableDays", Array.isArray(value) ? value : value ? [value] : [])} error={Boolean(errors.applicableDays)} helperText={errors.applicableDays} />
            </Box>
          </CardContent>
        </Card>
        <Box className="shift-form-checkboxes">
          <Box className="shift-form-option" sx={{ width: 120 }}>
            <MultiselectAutoComplete label="Overtime Allowed" name="overtimeAllowed" value={formData.overtimeAllowed ? "true" : "false"} options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} multiple={false} disableClearable size="small" onChange={(value) => updateField("overtimeAllowed", (Array.isArray(value) ? value[0] : value) === "true")} />
          </Box>
          <Box className="shift-form-option" sx={{ width: 120 }}>
            <MultiselectAutoComplete label="Night Shift" name="nightShift" value={formData.nightShift ? "true" : "false"} options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} multiple={false} disableClearable size="small" onChange={(value) => updateField("nightShift", (Array.isArray(value) ? value[0] : value) === "true")} />
          </Box>
          <Box className="shift-form-option" sx={{ width: 120 }}>
            <MultiselectAutoComplete label="Weekly Off" name="weeklyOff" value={formData.weeklyOff ? "true" : "false"} options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} multiple={false} disableClearable size="small" onChange={(value) => updateField("weeklyOff", (Array.isArray(value) ? value[0] : value) === "true")} />
          </Box>
        </Box>
        <Box className="shift-form-textareas">
          <TextArea label="Description" name="description" value={formData.description} onChange={handleChange} error={Boolean(errors.description)} helperText={errors.description} minRows={4} />
          <TextArea label="Remarks" name="remarks" value={formData.remarks} onChange={handleChange} error={Boolean(errors.remarks)} helperText={errors.remarks} minRows={4} />
        </Box>
        <Box className="shift-form-attachment">
          <Box className="shift-form-attachment-row">
            <Box className="shift-form-field-icon shift-icon-blue"><AttachFileOutlinedIcon /></Box>
            <Box className="shift-form-attachment-content">
              <Attachment label="Choose Attachment" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
              {selectedFile && (
                <Typography variant="body2" className="shift-form-selected-file">Selected file: {selectedFile.name}</Typography>
              )}
              {errors.attachment && (
                <Typography variant="caption" className="shift-form-attachment-error">{errors.attachment}</Typography>
              )}
            </Box>
          </Box>
        </Box>
        <Box className="shift-form-status">
          <Box className="shift-form-status-control">
            <MultiselectAutoComplete label="Shift Status" name="status" value={formData.status ? "true" : "false"} options={[{ label: "Active", value: "true" }, { label: "Inactive", value: "false" }]} multiple={false} onChange={(value) => updateField("status", (Array.isArray(value) ? value[0] : value) === "true")} disableClearable />
          </Box>
        </Box>
        <Box className="shift-form-actions" sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
          <Button type="submit" variant="contained" className="shift-form-submit-button"   sx={{ backgroundColor: "#15803d", color: "#ffffff", "&:hover": { backgroundColor: "#166534" } }}>Update Shift</Button>
         <Button type="button" variant="contained" onClick={onBack} className="shift-form-back-button" sx={{ backgroundColor: "#dc2626", color: "#ffffff", "&:hover": { backgroundColor: "#b91c1c" } }}>Back</Button>
        </Box>
      </form>
    </Paper>
  );
}
export default UpdateShiftForm;
