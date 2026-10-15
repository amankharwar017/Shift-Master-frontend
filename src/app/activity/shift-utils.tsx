import { useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { GridSortModel } from "@mui/x-data-grid";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { MRT_ColumnDef, MRT_PaginationState, MRT_SortingState } from "material-react-table";
import DataTable from "../../components/Table";
import type { ShiftResponse } from "../../types/shift";
interface ShiftListTableProps {
    shifts: ShiftResponse[];
    totalRows: number;
    paginationModel: { page: number; pageSize: number };
    setPaginationModel: Dispatch<SetStateAction<{ page: number; pageSize: number }>>;
    sortModel: GridSortModel;
    setSortModel: Dispatch<SetStateAction<GridSortModel>>;
    onDeleteClick: (shift: ShiftResponse) => void;
    onEdit: (shiftId: number) => void;
    onViewHistory: (shiftId: number) => void;
}
const shiftColumns = [
    ["Shift Code", "shiftCode"],
    ["Shift Name", "shiftName"],
    ["Shift Type", "shiftType"],
    ["Start Time", "startTime"],
    ["End Time", "endTime"],
    ["Working Hours", "workingHours"],
    ["Night Shift", "nightShift"],
    ["Overtime", "overtimeAllowed"],
    ["Status", "status"],
    ["Created On", "createdAt"],
    ["Updated On", "updatedAt"],
] as const satisfies readonly (readonly [string, keyof ShiftResponse])[];
const renderShiftValue = (shift: ShiftResponse, key: keyof ShiftResponse) => {
    const value = shift[key];
    if (key === "nightShift") return <Chip label={shift.nightShift ? "Yes" : "No"} size="small" color={shift.nightShift ? "warning" : "default"} variant={shift.nightShift ? "filled" : "outlined"} />;
    if (key === "overtimeAllowed") return <Chip label={shift.overtimeAllowed ? "Yes" : "No"} size="small" color={shift.overtimeAllowed ? "success" : "default"} variant={shift.overtimeAllowed ? "filled" : "outlined"} />;
    if (key === "status") return <Chip label={shift.status ? "Active" : "Inactive"} size="small" color={shift.status ? "success" : "default"} variant={shift.status ? "filled" : "outlined"} />;
    if (key === "createdAt" || key === "updatedAt") {
        if (!value) return "N/a";
        const [date, time] = String(value).split("T");
        return <>{date}<br />{time?.split(".")[0]}</>;
    }
    if (value === null || value === undefined || value === "") return "N/a";
    if (value instanceof Set || Array.isArray(value)) return [...value].join(", ");
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
};
const ShiftListTable = ({ shifts, totalRows, paginationModel, setPaginationModel, sortModel, setSortModel, onDeleteClick, onEdit, onViewHistory }: ShiftListTableProps) => {
    const pagination: MRT_PaginationState = { pageIndex: paginationModel.page, pageSize: paginationModel.pageSize };
    const sorting: MRT_SortingState = sortModel.filter((item) => item.sort !== null && item.sort !== undefined).map((item) => ({ id: item.field, desc: item.sort === "desc" }));
    const shiftTableColumns = useMemo<MRT_ColumnDef<ShiftResponse>[]>(() => shiftColumns.map(([header, key]) => ({
        id: String(key),
        header,
        accessorFn: (shift) => shift[key],
        enableSorting: key === "shiftCode",
        enableColumnFilter: false,
        size: 150,
        minSize: 120,
        Cell: ({ row }) => renderShiftValue(row.original, key),
    })), []);
    return (
        <Box className="shift-table-card" sx={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}>
            <Box className="shift-table-card-content">
                <DataTable<ShiftResponse>
                    data={shifts}
                    columns={shiftTableColumns}
                    getRowId={(row) => String(row.id)}
                    recordCount={totalRows}
                    countText={`Total: ${totalRows}`}
                    emptyMessage="No shifts found"
                    enableRowActions
                    renderRowActions={(shift) => (
                        <Box className="shift-table-actions" sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 0.5 }}>
                            {shift.status && !shift.isDeleted && <Tooltip title="Delete"><IconButton size="small" className="shift-delete-button" onClick={() => onDeleteClick(shift)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>}
                            <Tooltip title="Edit"><IconButton size="small" className="shift-edit-button" onClick={() => onEdit(shift.id)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="View"><IconButton size="small" className="shift-view-button" onClick={() => onViewHistory(shift.id)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                        </Box>
                    )}
                    maxHeight="60vh"
                    tableOptions={{
                        manualPagination: true,
                        manualSorting: true,
                        rowCount: totalRows,
                        displayColumnDefOptions: { "mrt-row-actions": { header: "Action", size: 150, minSize: 150 } },
                        onPaginationChange: (updater) => {
                            const nextPagination = typeof updater === "function" ? updater(pagination) : updater;
                            setPaginationModel({ page: nextPagination.pageIndex, pageSize: nextPagination.pageSize });
                        },
                        onSortingChange: (updater) => {
                            const nextSorting = typeof updater === "function" ? updater(sorting) : updater;
                            setSortModel(nextSorting.map((item) => ({ field: item.id, sort: item.desc ? "desc" : "asc" })));
                        },
                        state: { pagination, sorting },
                        initialState: { density: "compact", showGlobalFilter: true },
                        muiTablePaperProps: { elevation: 0, className: "shift-table-grid-wrapper", sx: { backgroundColor: "transparent", boxShadow: "none", width: "100%", maxWidth: "100%", overflow: "hidden" } },
                        muiTableContainerProps: { sx: { maxHeight: "60vh", overflow: "auto", position: "relative", isolation: "isolate", scrollbarWidth: "auto", "&::-webkit-scrollbar": { width: "12px", height: "12px" }, "&::-webkit-scrollbar-track": { backgroundColor: "#e5e7eb" }, "&::-webkit-scrollbar-thumb": { backgroundColor: "#6b7280", borderRadius: "6px" }, "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#374151" }, "& thead th": { paddingTop: "6px", paddingBottom: "6px" } } },
                        muiTableProps: { className: "shift-data-grid", stickyHeader: true, sx: { minWidth: 1400, borderCollapse: "separate", borderSpacing: 0 } },
                        muiTableHeadCellProps: { sx: { whiteSpace: "nowrap", fontWeight: 700, color: "#ffffff", backgroundColor: "#111111", "& .Mui-TableHeadCell-Content": { color: "#ffffff" }, "& .MuiTableSortLabel-root": { color: "#ffffff !important", opacity: 1 }, "& .MuiTableSortLabel-root:hover": { color: "#ffffff !important" }, "& .MuiTableSortLabel-icon": { color: "#ffffff !important", opacity: 1, visibility: "visible" }, "& .MuiTableSortLabel-root.Mui-active .MuiTableSortLabel-icon": { color: "#ffffff !important", opacity: 1, visibility: "visible" }, "& .MuiButtonBase-root": { color: "#ffffff" } } },
                        muiTableBodyRowProps: { hover: true, sx: { "&:hover": { backgroundColor: "#f3f4f6" } } },
                        muiTableBodyCellProps: { sx: { whiteSpace: "nowrap" } }
                    }}
                />

            </Box>
        </Box>
    );
};
export default ShiftListTable;
