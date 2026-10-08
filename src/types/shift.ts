export interface ShiftFormData {
  shiftCode: string;
  shiftName: string;
  displayName: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  graceIn: number | null;
  graceOut: number | null;
  overtimeAllowed: boolean;
  nightShift: boolean;
  weeklyOff: boolean;
  shiftColor: string;
  applicableDays: string[];
  description: string;
  attachment: string;
  remarks: string;
  status: boolean;
}

export interface ShiftResponse {
  id: number;
  shiftCode: string;
  shiftName: string;
  displayName: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  workingHours: number;
  graceIn: number | null;
  graceOut: number | null;
  overtimeAllowed: boolean;
  nightShift: boolean;
  weeklyOff: boolean;
  shiftColor: string;
  applicableDays: string[];
  description: string;
  attachment: string;
  remarks: string;
  status: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}