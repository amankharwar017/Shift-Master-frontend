import { useEffect, useState } from "react";
import type { GridSortModel } from "@mui/x-data-grid";
import { Alert, Snackbar } from "@mui/material";
import DashboardLayout from "./components/DashboardLayout";
import ShiftManagementHeader from "./components/ShiftManagementHeader";
import ShiftSummaryCards from "./components/ShiftSummaryCards";
import ShiftForm from "./components/ShiftForm";
import ShiftTable from "./components/ShiftTable";
import ShiftSearchForm from "./components/ShiftSearchForm";
import {
  getShiftList,
  getShiftById,
  searchShifts,
  deleteShift,
} from "./api/shiftApi";
import type { ShiftResponse } from "./types/shift";

function App() {
  const [showForm, setShowForm] = useState(false);
  const [showList, setShowList] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [shifts, setShifts] = useState<ShiftResponse[]>([]);
  const [editShiftId, setEditShiftId] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "id", sort: "asc" },
  ]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalShifts, setTotalShifts] = useState(0);
  const [activeShifts, setActiveShifts] = useState(0);
  const [inactiveShifts, setInactiveShifts] = useState(0);
  const [nightShifts, setNightShifts] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedShift, setSelectedShift] = useState<ShiftResponse | null>(
    null
  );

  const fetchShifts = async () => {
    try {
      const sort =
        sortModel.length > 0
          ? `${sortModel[0].field},${sortModel[0].sort}`
          : "id,asc";

      if (Object.keys(searchParams).length > 0) {
        let response;

        if (searchParams.searchText?.trim()) {
          const searchText = searchParams.searchText.trim();
          const { searchText: _, ...otherParams } = searchParams;

          response = await searchShifts(
            { ...otherParams, shiftCode: searchText },
            paginationModel.page,
            paginationModel.pageSize,
            sort
          );

          let filteredContent = (response.data?.content ?? []).filter(
            (shift: ShiftResponse) =>
              shift.shiftCode?.toLowerCase() === searchText.toLowerCase()
          );

          if (filteredContent.length === 0) {
            response = await searchShifts(
              { ...otherParams, shiftName: searchText },
              paginationModel.page,
              paginationModel.pageSize,
              sort
            );

            filteredContent = (response.data?.content ?? []).filter(
              (shift: ShiftResponse) =>
                shift.shiftName?.toLowerCase() === searchText.toLowerCase()
            );
          }

          setShifts(filteredContent);
          setTotalRows(filteredContent.length);
        } else {
          response = await searchShifts(
            searchParams,
            paginationModel.page,
            paginationModel.pageSize,
            sort
          );

          setShifts(response.data?.content ?? []);
          setTotalRows(response.data?.totalElements ?? 0);
        }
      } else {
        const response = await getShiftList(
          paginationModel.page,
          paginationModel.pageSize,
          sort
        );

        setShifts(response.data?.content ?? []);
        setTotalRows(response.data?.totalElements ?? 0);
      }
    } catch (error) {
      console.error("Failed to fetch shifts:", error);
    }
  };

  const fetchSummaryCounts = async () => {
    try {
      const [
        totalResponse,
        activeResponse,
        inactiveResponse,
        nightResponse,
      ] = await Promise.all([
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
    setShowList(false);
    setShowSearch(false);
  };

  const handleShiftList = () => {
    setShowForm(false);
    setShowList(true);
    setShowSearch(false);
    setSearchParams({});
  };

  const handleSearchShift = () => {
    setShowForm(false);
    setShowList(false);
    setShowSearch(true);
  };

  const handleEdit = (shiftId: number) => {
    setEditShiftId(shiftId);
    setShowForm(true);
    setShowList(false);
    setShowSearch(false);
  };

  const handleView = async (shiftId: number) => {
    try {
      const response = await getShiftById(shiftId);
      setSelectedShift(response.data);
    } catch (error) {
      console.error("Failed to fetch shift details:", error);
    }
  };

  const handleCloseView = () => {
    setSelectedShift(null);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setShowList(true);
    setShowSearch(false);
    setEditShiftId(null);
  };

  const handleBackToSearch = () => {
    setShowForm(false);
    setShowList(false);
    setShowSearch(true);
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
    setPaginationModel({
      page: 0,
      pageSize: paginationModel.pageSize,
    });
    setShowSearch(false);
    setShowList(true);
  };

  return (
    <>
      <DashboardLayout onAddShift={handleAddShift} showAddButton={!showForm}>
        <ShiftManagementHeader />

        {showForm && (
          <ShiftForm
            editShiftId={editShiftId}
            onSuccess={(message) => {
              setSuccessMessage(message);
              setShowForm(false);
              setShowList(true);
              setEditShiftId(null);
              fetchShifts();
              fetchSummaryCounts();
            }}
            onBack={handleBackToList}
          />
        )}

        {!showForm && (
          <>
            <div className="dashboard-search-summary">
              <ShiftSearchForm onSearch={handleSearch} />

              <ShiftSummaryCards
                total={totalShifts}
                active={activeShifts}
                inactive={inactiveShifts}
                night={nightShifts}
              />
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
          </>
        )}
      </DashboardLayout>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={2000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setSuccessMessage("")}
          severity="success"
          variant="filled"
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default App;