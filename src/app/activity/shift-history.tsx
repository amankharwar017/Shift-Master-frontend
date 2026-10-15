import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { MRT_ColumnDef } from "material-react-table";
import DataTable from "../../components/Table";
import { getShiftHistory, getShiftById } from "../shift-api";

export interface ShiftHistoryRecord {
    id: number;
    shiftId: number;
    shiftCode: string;
    operation: "CREATE" | "UPDATE" | "DELETE" | string;
    operationAt: string;
    oldValues: Record<string, unknown> | null;
    newValues: Record<string, unknown> | null;
}

interface ShiftHistoryProps {
    shiftId: number | null;
    shiftCode: string;
    onClose: () => void;
}

const historyFields: { header: string; accessorKey: string }[] = [
    { header: "Shift Code", accessorKey: "shiftCode" },
    { header: "Shift Name", accessorKey: "shiftName" },
    { header: "Display Name", accessorKey: "displayName" },
    { header: "Shift Type", accessorKey: "shiftType" },
    { header: "Start Time", accessorKey: "startTime" },
    { header: "End Time", accessorKey: "endTime" },
    { header: "Break Start", accessorKey: "breakStart" },
    { header: "Break End", accessorKey: "breakEnd" },
    { header: "Working Hours", accessorKey: "workingHours" },
    { header: "Grace In", accessorKey: "graceIn" },
    { header: "Grace Out", accessorKey: "graceOut" },
    { header: "Overtime Allowed", accessorKey: "overtimeAllowed" },
    { header: "Night Shift", accessorKey: "nightShift" },
    { header: "Weekly Off", accessorKey: "weeklyOff" },
    { header: "Shift Color", accessorKey: "shiftColor" },
    { header: "Applicable Days", accessorKey: "applicableDays" },
    { header: "Description", accessorKey: "description" },
    { header: "Attachment", accessorKey: "attachment" },
    { header: "Remarks", accessorKey: "remarks" },
    { header: "Status", accessorKey: "status" },
    { header: "Created By", accessorKey: "createdBy" },
    { header: "Created On", accessorKey: "createdAt" },
    { header: "Updated By", accessorKey: "updatedBy" }
];

const formatHistoryValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.length ? value.join(", ") : "N/A";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
};

const isHistoryValueChanged = (oldValue: unknown, newValue: unknown): boolean =>
    JSON.stringify(oldValue ?? null) !== JSON.stringify(newValue ?? null);

const formatHistoryDateTime = (value: unknown) => {
    if (value === null || value === undefined || value === "") return { date: "-", time: "-" };
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return { date: String(value), time: "-" };
    return { date: date.toLocaleDateString(), time: date.toLocaleTimeString() };
};

const renderHistoryDateTimeCell = (value: unknown) => {
    const { date, time } = formatHistoryDateTime(value);
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
            <Typography variant="body2" sx={{ fontSize: "0.78rem" }}>{date}</Typography>
            <Typography variant="body2" sx={{ fontSize: "0.78rem" }}>{time}</Typography>
        </Box>
    );
};

const renderHistoryActionCell = (operation: string) => {
    const label = operation === "CREATE" ? "Created" : operation === "UPDATE" ? "Updated" : operation === "DELETE" ? "Deleted" : operation;
    const color = operation === "CREATE" ? "#15803d" : operation === "UPDATE" ? "#0369a1" : operation === "DELETE" ? "#b91c1c" : "#374151";
    const backgroundColor = operation === "CREATE" ? "#dcfce7" : operation === "UPDATE" ? "#e0f2fe" : operation === "DELETE" ? "#fee2e2" : "#f3f4f6";
    return (
        <Typography sx={{ display: "inline-block", fontSize: "0.78rem", fontWeight: 600, color, backgroundColor, borderRadius: "4px", px: 1, py: 0.4 }}>
            {label}
        </Typography>
    );
};

const getHistoryFieldValue = (record: ShiftHistoryRecord, key: string) =>
    record.newValues && Object.prototype.hasOwnProperty.call(record.newValues, key)
        ? record.newValues[key]
        : record.oldValues?.[key];

const renderHistoryFieldCell = (record: ShiftHistoryRecord, key: string) => {
    const oldValue = record.oldValues?.[key];
    const hasNewValue = record.newValues !== null && Object.prototype.hasOwnProperty.call(record.newValues, key);
    const newValue = hasNewValue ? record.newValues?.[key] : undefined;
    const value = hasNewValue ? newValue : oldValue;
    const changed = record.operation === "UPDATE" && hasNewValue && isHistoryValueChanged(oldValue, newValue);
    const sx = {
        px: changed ? 0.75 : 0,
        py: changed ? 0.4 : 0,
        borderRadius: "3px",
        backgroundColor: changed ? "#fff0b3" : "transparent",
        color: changed ? "#664d03" : "inherit",
        fontWeight: changed ? 600 : 400,
        fontSize: "0.78rem"
    };
    if (key === "createdAt" || key === "updatedAt") {
        const { date, time } = formatHistoryDateTime(value);
        return (
            <Box component="span" sx={{ ...sx, display: "flex", flexDirection: "column", gap: 0.25 }}>
                <Typography component="span" sx={{ fontSize: "inherit", fontWeight: "inherit" }}>{date}</Typography>
                <Typography component="span" sx={{ fontSize: "inherit", fontWeight: "inherit" }}>{time}</Typography>
            </Box>
        );
    }
    return (
        <Box component="span" sx={{ ...sx, display: "inline-block", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
            {formatHistoryValue(value)}
        </Box>
    );
};

const ShiftHistory = ({ shiftId, shiftCode, onClose }: ShiftHistoryProps) => {
    const [history, setHistory] = useState<ShiftHistoryRecord[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");
    const open = shiftId !== null;

    useEffect(() => {
        if (shiftId === null) return;
        let active = true;

        const fetchHistory = async () => {
            setHistoryLoading(true);
            setHistoryError("");
            setHistory([]);

            try {
                const response = await getShiftHistory(shiftId);
                const records: ShiftHistoryRecord[] = Array.isArray(response.data) ? response.data : [];
                records.sort((a, b) => new Date(b.operationAt).getTime() - new Date(a.operationAt).getTime());

                if (records.length > 0) {
                    if (active) setHistory(records);
                } else {
                    const shiftResponse = await getShiftById(shiftId);
                    const shiftData = shiftResponse.data as Record<string, unknown>;
                    const createdRecord: ShiftHistoryRecord = {
                        id: shiftId,
                        shiftId,
                        shiftCode: String(shiftData.shiftCode ?? shiftCode),
                        operation: "CREATE",
                        operationAt: String(shiftData.createdAt ?? new Date().toISOString()),
                        oldValues: null,
                        newValues: shiftData
                    };
                    if (active) setHistory([createdRecord]);
                }
            } catch (error) {
                if (active) setHistoryError("Failed to load shift history.");
            } finally {
                if (active) setHistoryLoading(false);
            }
        };

        void fetchHistory();
        return () => {
            active = false;
        };
    }, [shiftId, shiftCode]);

    const historyColumns = useMemo<MRT_ColumnDef<ShiftHistoryRecord>[]>(() => [
        {
            id: "dateTime",
            header: "Updated On",
            accessorFn: (row) => row.operationAt,
            enableSorting: false,
            size: 175,
            minSize: 160,
            Cell: ({ row }) => renderHistoryDateTimeCell(row.original.operationAt)
        },
        {
            id: "action",
            header: "Action",
            accessorFn: (row) => row.operation,
            enableSorting: false,
            size: 120,
            minSize: 110,
            Cell: ({ row }) => renderHistoryActionCell(row.original.operation)
        },
        ...historyFields.map(({ header, accessorKey }): MRT_ColumnDef<ShiftHistoryRecord> => ({
            id: accessorKey,
            header,
            accessorFn: (row) => getHistoryFieldValue(row, accessorKey),
            enableSorting: false,
            size: 160,
            minSize: 130,
            Cell: ({ row }) => renderHistoryFieldCell(row.original, accessorKey)
        }))
    ], []);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl" slotProps={{ paper: { sx: { borderRadius: "4px", overflow: "hidden", maxWidth: "95vw" } } }}>
            <DialogContent sx={{ p: 0, backgroundColor: "#ffffff" }}>
                <Box sx={{ width: "100%" }}>
                    <Box sx={{ backgroundColor: "#111111", color: "#ffffff", px: 2.5, py: 1.5, borderRadius: "6px 6px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>Shift History</Typography>
                            <Typography variant="caption" sx={{ color: "#d1d5db" }}>{shiftCode} - Historical Records</Typography>
                        </Box>
                        <IconButton onClick={onClose} aria-label="Close shift history" sx={{ color: "#ffffff", ml: 2, "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" } }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    {historyError && <Alert severity="error" sx={{ my: 1 }}>{historyError}</Alert>}
                    <DataTable<ShiftHistoryRecord>
                        data={history}
                        columns={historyColumns}
                        getRowId={(row) => String(row.id)}
                        emptyMessage="No history records available"
                        maxHeight="60vh"
                        tableOptions={{
                            enableTopToolbar: false,
                            state: { isLoading: historyLoading },
                            initialState: {
                                density: "compact",
                                pagination: { pageIndex: 0, pageSize: 10 }
                            }
                        }}
                    />
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ShiftHistory;
