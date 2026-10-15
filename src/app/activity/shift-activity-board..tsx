import { useEffect, useState } from "react";
import type { GridSortModel } from "@mui/x-data-grid";
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Drawer, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import ShiftForm from "./add-form.";
import EditForm from "./update-form";
import ShiftSearchForm from "./shift-search-form";
import { getShiftList, searchShifts, deleteShift } from "../shift-api";
import type { ShiftResponse } from "../../types/shift";
import type { RootState } from "../../redux/store";
import { setShifts } from "../../redux/shiftSlice";
import Swal from "sweetalert2";
import ShiftHistory from "./shift-history";
import ShiftListTable from "./shift-utils";

const showTimedAlert = (title: string, text: string, icon: "success" | "error") => Swal.fire({
    title,
    text,
    icon,
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
    heightAuto: false,
    didOpen: (popup) => popup.parentElement!.style.zIndex = "20000"

});

type SummaryFilter = "all" | "active" | "inactive" | "night";
const filterLabels: Record<string, string> = { searchText: "Search", shiftCode: "Shift Code", shiftName: "Shift Name", shiftType: "Shift Type", status: "Status", nightShift: "Night Shift", overtimeAllowed: "Overtime", weeklyOff: "Weekly Off", createdDateFrom: "Created From", createdDateTo: "Created To", createdAtFrom: "Created From", createdAtTo: "Created To", startTime: "Start Time", endTime: "End Time", applicableDays: "Applicable Days" };

const formatFilterValue = (value: unknown): string => {
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.join(", ");
    if (value instanceof Set) return [...value].join(", ");
    return String(value);
};

function Activityboard() {
    const dispatch = useDispatch();
    const shifts = useSelector((state: RootState) => state.shift.shifts);
    const [showForm, setShowForm] = useState(false);
    const [editShiftId, setEditShiftId] = useState<number | null>(null);
    const [searchParams, setSearchParams] = useState<Record<string, any>>({});
    const [draftFilters, setDraftFilters] = useState<Record<string, any>>({});
    const [removeFilterHandler, setRemoveFilterHandler] = useState<((key: string, value?: string) => void) | null>(null);
    const [summaryFilter, setSummaryFilter] = useState<SummaryFilter>("all");
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [sortModel, setSortModel] = useState<GridSortModel>([{ field: "id", sort: "asc" }]);
    const [totalRows, setTotalRows] = useState(0);
    const [totalShifts, setTotalShifts] = useState(0);
    const [activeShifts, setActiveShifts] = useState(0);
    const [inactiveShifts, setInactiveShifts] = useState(0);
    const [nightShifts, setNightShifts] = useState(0);
    const [historyShiftId, setHistoryShiftId] = useState<number | null>(null);
    const [historyShiftCode, setHistoryShiftCode] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [shiftToDelete, setShiftToDelete] = useState<ShiftResponse | null>(null);

    const fetchShifts = async () => {
        try {
            const sort = sortModel.length > 0 ? `${sortModel[0].field},${sortModel[0].sort}` : "id,asc";
            const filters = { ...searchParams };
            if (summaryFilter === "active") filters.status = true;
            if (summaryFilter === "inactive") filters.status = false;
            if (summaryFilter === "night") filters.nightShift = true;
            if (Object.keys(filters).length > 0) {
                let response;
                if (filters.searchText?.trim()) {
                    const searchText = filters.searchText.trim();
                    const { searchText: _, ...otherParams } = filters;
                    response = await searchShifts({ ...otherParams, shiftCode: searchText }, paginationModel.page, paginationModel.pageSize, sort);
                    let filteredContent = (response.data?.content ?? []).filter((shift: ShiftResponse) => shift.shiftCode?.toLowerCase() === searchText.toLowerCase());
                    if (filteredContent.length === 0) {
                        response = await searchShifts({ ...otherParams, shiftName: searchText }, paginationModel.page, paginationModel.pageSize, sort);
                        filteredContent = (response.data?.content ?? []).filter((shift: ShiftResponse) => shift.shiftName?.toLowerCase() === searchText.toLowerCase());
                    }
                    dispatch(setShifts(filteredContent));
                    setTotalRows(response.data?.totalElements ?? filteredContent.length);
                } else {
                    response = await searchShifts(filters, paginationModel.page, paginationModel.pageSize, sort);
                    dispatch(setShifts(response.data?.content ?? []));
                    setTotalRows(response.data?.totalElements ?? 0);
                }
            } else {
                const response = await getShiftList(paginationModel.page, paginationModel.pageSize, sort);
                dispatch(setShifts(response.data?.content ?? []));
                setTotalRows(response.data?.totalElements ?? 0);
            }
        } catch (error) {
            console.error("Failed to fetch shifts:", error);
        }
    };

    const fetchSummaryCounts = async () => {
        try {
            const [totalResponse, activeResponse, inactiveResponse, nightResponse] = await Promise.all([
                getShiftList(0, 1, "id,asc"),
                searchShifts({ status: true }, 0, 1, "id,asc"),
                searchShifts({ status: false }, 0, 1, "id,asc"),
                searchShifts({ nightShift: true }, 0, 1, "id,asc"),
            ]);
            setTotalShifts(totalResponse.data?.totalElements ?? 0);
            setActiveShifts(activeResponse.data?.totalElements ?? 0);
            setInactiveShifts(inactiveResponse.data?.totalElements ?? 0);
            setNightShifts(nightResponse.data?.totalElements ?? 0);
        } catch (error) {
            console.error("Failed to fetch shift summary counts:", error);
        }
    };

    const refreshShiftData = async () => {
        await Promise.all([fetchShifts(), fetchSummaryCounts()]);
    };

    useEffect(() => {
        fetchShifts();
    }, [paginationModel, sortModel, searchParams, summaryFilter]);

    useEffect(() => {
        fetchSummaryCounts();
    }, []);

    const handleAddShift = () => {
        setEditShiftId(null);
        setShowForm(true);
    };

    const handleEdit = (shiftId: number) => {
        setEditShiftId(shiftId);
        setShowForm(true);
    };

    const handleViewHistory = (shiftId: number) => {
        const selectedShiftRow = shifts.find((shift) => shift.id === shiftId);
        setHistoryShiftCode(selectedShiftRow?.shiftCode ?? "");
        setHistoryShiftId(shiftId);
    };

    const handleBackToList = () => {
        setShowForm(false);
        setEditShiftId(null);
    };

    const handleFormError = (message: string) => {
        void showTimedAlert("Error!", message, "error");
    };

    const handleFormSuccess = async (message: string) => {
        setShowForm(false);
        setEditShiftId(null);
        await refreshShiftData();
        await showTimedAlert("Success!", message, "success");
    };


    const handleDelete = async (shift?: ShiftResponse, action?: "confirm" | "cancel") => {
        if (action === "cancel") {
            setDeleteDialogOpen(false);
            setShiftToDelete(null);
            return;
        }
        if (action === "confirm") {
            if (!shiftToDelete) return;

            const selectedShiftId = shiftToDelete.id;
            setDeleteDialogOpen(false);
            setShiftToDelete(null);
            try {
                await deleteShift(selectedShiftId);
                await refreshShiftData();
                await showTimedAlert("Success!", "Shift deactivated successfully.", "success");
            } catch (error) {
                console.error("Failed to deactivate shift:", error);
                await showTimedAlert("Error!", "Failed to deactivate shift.", "error");
            }
            return;
        }
        if (shift) {
            setShiftToDelete(shift);
            setDeleteDialogOpen(true);
        }
    };


    const handleDraftFiltersChange = (filters: Record<string, any>, removeFilter: (key: string, value?: string) => void) => {
        setDraftFilters(filters);
        setRemoveFilterHandler(() => removeFilter);
    };

    const handleSearch = (searchData: Record<string, any>) => {
        setSearchParams(searchData);
        setSummaryFilter("all");
        setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
    };

    const handleSummaryClick = (filter: SummaryFilter) => {
        setSummaryFilter(filter);
        setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
    };

    const handleCloseHistory = () => {
        setHistoryShiftId(null);
        setHistoryShiftCode("");
    };

    const activeFilters = Object.entries(draftFilters).filter(([, value]) => value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0)).flatMap(([key, value]) => {
        const label = filterLabels[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
        if (Array.isArray(value)) return value.map((item) => ({ key, itemValue: String(item), label, value: String(item) }));
        return [{ key, label, value: formatFilterValue(value) }];
    });

    return (
        <>
            <Box className="dashboard-layout">
                <Sidebar />
                <Box component="main" className="dashboard-main">
                    <Header />
                    <Box className="dashboard-content">
                        <Box sx={{ mb: 2 }}>
                            <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>Shift Master</Typography>
                            <Typography component="p" variant="body2" color="text.secondary">Manage shift details, operational status and records</Typography>
                        </Box>
                        <ShiftSearchForm onSearch={handleSearch} onFiltersChange={handleDraftFiltersChange} totalShifts={totalShifts} activeShifts={activeShifts} inactiveShifts={inactiveShifts} nightShifts={nightShifts} onSummaryClick={handleSummaryClick} />
                        {historyShiftId !== null ? (
                            <ShiftHistory
                                shiftId={historyShiftId}
                                shiftCode={historyShiftCode}
                                onClose={handleCloseHistory} />
                        ) : (<>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, px: 1.5, py: 1.25, mb: 1, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "4px" }}>
                                <FilterListIcon sx={{ color: "#64748b", fontSize: 19 }} />
                                <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>Active Filters:</Typography>
                                {activeFilters.length === 0 ? (
                                    <Typography sx={{ fontSize: "0.8rem", color: "#64748b", fontStyle: "italic" }}>All records showing (No filters active)</Typography>
                                ) : activeFilters.map((filter, index) => (
                                    <Chip key={`${filter.key}-${filter.value}-${index}`} size="small" variant="outlined" label={`${filter.label}: ${filter.value}`} onDelete={() => filter.key === "summary" ? setSummaryFilter("all") : removeFilterHandler?.(filter.key, "itemValue" in filter ? String(filter.itemValue) : undefined)} sx={{ height: 25, fontSize: "0.73rem", backgroundColor: "#f8fafc", borderColor: "#cbd5e1", color: "#475569" }} />
                                ))}
                                <Typography sx={{ fontSize: "0.75rem", color: "#475569", whiteSpace: "nowrap", ml: "auto" }}>{totalRows} records found</Typography>
                            </Box>
                            <ShiftListTable
                                shifts={shifts}
                                totalRows={totalRows}
                                paginationModel={paginationModel}
                                setPaginationModel={setPaginationModel}
                                sortModel={sortModel}
                                setSortModel={setSortModel}
                                onDeleteClick={(shift) => handleDelete(shift)}
                                onEdit={handleEdit}
                                onViewHistory={handleViewHistory} />
                        </>
                        )}
                        <Dialog open={deleteDialogOpen} onClose={() => handleDelete(undefined, "cancel")} maxWidth="xs" fullWidth>
                            <DialogTitle>Confirm Delete</DialogTitle>
                            <DialogContent><DialogContentText>Are you sure you want to delete shift <strong>{shiftToDelete?.shiftCode}</strong> ({shiftToDelete?.shiftName})?</DialogContentText></DialogContent>
                            <DialogActions sx={{ p: 2, gap: 1 }}>
                                <Button variant="outlined" onClick={() => handleDelete(undefined, "cancel")}>Cancel</Button>
                                <Button variant="contained" color="error" onClick={() => handleDelete(undefined, "confirm")} autoFocus>Yes, Delete</Button>
                            </DialogActions>
                        </Dialog>
                    </Box>
                    {!showForm && <Button variant="contained" onClick={handleAddShift} className="dashboard-add-button"><AddIcon /></Button>}
                </Box>
            </Box>
            <Drawer anchor="right" open={showForm} onClose={handleBackToList} className="shift-form-drawer">
                <div className="shift-form-drawer-content">
                    {editShiftId === null ? (
                        <ShiftForm onError={handleFormError} onSuccess={handleFormSuccess} onBack={handleBackToList} />
                    ) : (
                        <EditForm editShiftId={editShiftId} onError={handleFormError} onSuccess={handleFormSuccess} onBack={handleBackToList} />
                    )}
                </div>
            </Drawer>
        </>
    );
}
export default Activityboard;
