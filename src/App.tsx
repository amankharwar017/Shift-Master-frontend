import { useEffect, useState } from "react";
import type { GridSortModel } from "@mui/x-data-grid";
import { Alert, Box, Button, Card, CardContent, Drawer, Grid, Snackbar, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import NightlightIcon from "@mui/icons-material/Nightlight";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./app/layout/Sidebar";
import Header from "./app/layout/Header";
import ShiftForm from "./app/activity/ShiftForm";
import ShiftTable from "./app/activity/ShiftTable";
import ShiftSearchForm from "./app/activity/ShiftSearchForm";
import { getShiftList, getShiftById, searchShifts, deleteShift } from "./app/activity/shiftApi";
import type { ShiftResponse } from "./types/shift";
import type { RootState } from "./redux/store";
import { setShifts, setSelectedShift } from "./redux/slices/shiftSlice";

function App() {
  const dispatch = useDispatch();
  const shifts = useSelector((state: RootState) => state.shift.shifts);
  const selectedShift = useSelector((state: RootState) => state.shift.selectedShift);
  
  const [showForm, setShowForm] = useState(false);
  const [editShiftId, setEditShiftId] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: "id", sort: "asc" }]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalShifts, setTotalShifts] = useState(0);
  const [activeShifts, setActiveShifts] = useState(0);
  const [inactiveShifts, setInactiveShifts] = useState(0);
  const [nightShifts, setNightShifts] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchShifts = async () => {
    try {
      const sort = sortModel.length > 0 ? `${sortModel[0].field},${sortModel[0].sort}` : "id,asc";

      if (Object.keys(searchParams).length > 0) {
        let response;
        if (searchParams.searchText?.trim()) {
          const searchText = searchParams.searchText.trim();
          const { searchText: _, ...otherParams } = searchParams;
          response = await searchShifts({ ...otherParams, shiftCode: searchText }, paginationModel.page, paginationModel.pageSize, sort);
          let filteredContent = (response.data?.content ?? []).filter((shift: ShiftResponse) => shift.shiftCode?.toLowerCase() === searchText.toLowerCase());

          if (filteredContent.length === 0) {
            response = await searchShifts({ ...otherParams, shiftName: searchText }, paginationModel.page, paginationModel.pageSize, sort);
            filteredContent = (response.data?.content ?? []).filter((shift: ShiftResponse) => shift.shiftName?.toLowerCase() === searchText.toLowerCase());
          }

          dispatch(setShifts(filteredContent));
          setTotalRows(response.data?.totalElements ?? filteredContent.length);
        } else {
          response = await searchShifts(searchParams, paginationModel.page, paginationModel.pageSize, sort);
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

  useEffect(() => {
    fetchShifts();
  }, [paginationModel, sortModel, searchParams]);

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

  const handleView = async (shiftId: number) => {
    try {
      const response = await getShiftById(shiftId);
      dispatch(setSelectedShift(response.data));
    } catch (error) {
      console.error("Failed to fetch shift details:", error);
    }
  };

  const handleCloseView = () => {
    dispatch(setSelectedShift(null));
  };

  const handleBackToList = () => {
    setShowForm(false);
    setEditShiftId(null);
  };

  const handleDelete = async (shiftId: number) => {
    try {
      await deleteShift(shiftId);
      await fetchShifts();
      await fetchSummaryCounts();
    } catch (error) {
      console.error("Failed to delete shift:", error);
    }
  };

  const handleSearch = (searchData: Record<string, any>) => {
    setSearchParams(searchData);
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  return (
    <>
      <Box className="dashboard-layout">
        <Sidebar />
        <Box component="main" className="dashboard-main">
          <Header />
          <Box className="dashboard-content">
            <div className="dashboard-search-summary">
              <ShiftSearchForm onSearch={handleSearch} />
              <Grid container spacing={1} sx={{ marginBottom: 3 }}>
                {[
                  { title: "Total Shifts", value: totalShifts, icon: <AccessTimeIcon />, className: "summary-total" },
                  { title: "Active Shifts", value: activeShifts, icon: <CheckCircleIcon />, className: "summary-active" },
                  { title: "Inactive Shifts", value: inactiveShifts, icon: <CancelIcon />, className: "summary-inactive" },
                  { title: "Night Shifts", value: nightShifts, icon: <NightlightIcon />, className: "summary-night" },
                ].map((card) => (
                  <Grid size={{ xs: 12, sm: 6, md: 6 }} key={card.title}>
                    <Card elevation={0} className={`summary-card ${card.className}`}>
                      <CardContent>
                        <Box className="summary-card-content">
                          <Box>
                            <Typography variant="body2" className="summary-card-title">{card.title}</Typography>
                            <Typography variant="h4" className="summary-card-value">{card.value}</Typography>
                          </Box>
                          <Box className="summary-card-icon">{card.icon}</Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </div>
            <ShiftTable
              rows={shifts}
              rowCount={totalRows}
              paginationModel={paginationModel}
              onPaginationChange={setPaginationModel}
              sortModel={sortModel}
              onSortChange={setSortModel}
              edit={handleEdit}
              view={handleView}
              deleteShift={handleDelete}
              selectedShift={selectedShift}
              onCloseView={handleCloseView}
            />
          </Box>
          {!showForm && (
            <Button variant="contained" onClick={handleAddShift} className="dashboard-add-button">
              <AddIcon />
            </Button>
          )}
        </Box>
      </Box>
      <Drawer anchor="right" open={showForm} onClose={handleBackToList} className="shift-form-drawer">
        <div className="shift-form-drawer-content">
          <ShiftForm
            editShiftId={editShiftId}
            onSuccess={(message) => {
              setSuccessMessage(message);
              setShowForm(false);
              setEditShiftId(null);
              fetchShifts();
              fetchSummaryCounts();
            }}
            onBack={handleBackToList}
          />
        </div>
      </Drawer>
      <Snackbar open={Boolean(successMessage)} autoHideDuration={2000} onClose={() => setSuccessMessage("")} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
        <Alert onClose={() => setSuccessMessage("")} severity="success" variant="filled">
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default App;
