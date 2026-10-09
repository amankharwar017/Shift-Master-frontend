import { object, string, number, boolean, array } from "yup";

export const shiftValidationSchema = object({
  shiftCode: string()
    .required("Shift code is required")
    .max(20, "Shift code cannot exceed 20 characters"),

  shiftName: string()
    .required("Shift name is required")
    .max(100, "Shift name cannot exceed 100 characters"),

  displayName: string()
    .max(150, "Display name cannot exceed 150 characters")
    .nullable(),

  shiftType: string()
    .required("Shift type is required")
    .oneOf(
      ["General", "Morning", "Evening", "Night", "Rotational"],
      "Invalid shift type"),

  startTime: string()
    .required("Start time is required"),

  endTime: string()
    .required("End time is required")
    .test(
      "different-time",
      "End time cannot be same as start time",
      function (value) {
        return value !== this.parent.startTime;
      }
    ),

  breakStart: string()
    .nullable(),

  breakEnd: string()
    .nullable()
    .test(
      "break-end-after-start",
      "Break end time must be greater than break start time",
      function (value) {
        const { breakStart } = this.parent;

        if (!breakStart || !value) {
          return true;
        }

        return value > breakStart;
      }
    ),

  graceIn: number()
    .typeError("Grace in must be a numeric value")
    .min(0, "Grace in cannot be negative")
    .max(999, "Grace in cannot exceed 999")
    .nullable(),

  graceOut: number()
    .typeError("Grace out must be a numeric value")
    .min(0, "Grace out cannot be negative")
    .max(999, "Grace out cannot exceed 999")
    .nullable(),

  overtimeAllowed: boolean()
    .required(),

  nightShift: boolean()
    .required(),

  weeklyOff: boolean()
    .required(),

  shiftColor: string()
    .matches(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      "Shift color must be a valid HEX color"
    )
    .nullable(),

  applicableDays: array().of(string()).nullable(),

  description: string()
    .max(1000, "Description cannot exceed 1000 characters")
    .nullable(),

  attachment: string()
    .nullable(),

  remarks: string()
    .max(1000, "Remarks cannot exceed 1000 characters")
    .nullable(),

  status: boolean()
    .required("Status is required"),
});