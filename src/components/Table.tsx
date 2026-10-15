import { Box, Typography, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import type { MRT_ColumnDef, MRT_TableOptions } from "material-react-table";
import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
interface DataTableProps<TData extends object> {
  data: TData[];
  columns: MRT_ColumnDef<TData>[];
  getRowId?: (row: TData) => string;
  renderRowActions?: (row: TData) => ReactNode;
  title?: string;
  subtitle?: string;
  recordCount?: number;
  countText?: ReactNode;
  emptyMessage?: string;
  enableRowActions?: boolean;
  enablePagination?: boolean;
  maxHeight?: number | string;
  headerSx?: SxProps<Theme>;
  titleSx?: SxProps<Theme>;
  subtitleSx?: SxProps<Theme>;
  countSx?: SxProps<Theme>;
  tableOptions?: Partial<MRT_TableOptions<TData>>;
}
const combineSx = (base: SxProps<Theme>, custom?: SxProps<Theme>): SxProps<Theme> => {
  if (!custom) return base;
  return [base, ...(Array.isArray(custom) ? custom : [custom])] as SxProps<Theme>;
};
function DataTable<TData extends object>({
  data,
  columns,
  getRowId,
  renderRowActions,
  title,
  subtitle,
  recordCount,
  countText,
  emptyMessage = "No records found",
  enableRowActions = false,
  enablePagination = true,
  maxHeight = 500,
  headerSx,
  titleSx,
  subtitleSx,
  countSx,
  tableOptions = {},
}: DataTableProps<TData>) {
  const table = useMaterialReactTable<TData>({
    positionActionsColumn: "first",
    positionGlobalFilter: "left",
    enableStickyHeader: true,
    enableSorting: true,
    enableColumnFilters: false,
    enableGlobalFilter: true,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: true,
    enableHiding: true,
    enableColumnOrdering: false,
    enableFilters: true,
    enableTopToolbar: true,
    enableBottomToolbar: enablePagination,
    autoResetPageIndex: false,
    initialState: {
      density: "compact",
      showGlobalFilter: true,
      showToolbarDropZone: true,
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    muiSearchTextFieldProps: ({ table }) => ({
      placeholder: "search",
      variant: "outlined",
      size: "small",
      slotProps: {
        input: {
          startAdornment: (<InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>),
          endAdornment: table.getState().globalFilter ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                aria-label="Clear search"
                onClick={() => table.setGlobalFilter("")}
                edge="end"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      },
      sx: {
        width: "100%",
        maxWidth: 280,
        minWidth: 0,
        "& .MuiOutlinedInput-root": {
          height: 40,
          backgroundColor: "#ffffff",
        },
        "& .MuiInputAdornment-root": {
          color: "#64748b",
        },
      },
    }),
    muiTopToolbarProps: {
      sx: {
        minHeight: "56px",
        backgroundColor: "#ffffff",
        padding: { xs: "4px 8px", sm: "4px 16px" },
        "& .MuiBox-root": {
          alignItems: "center",
          flexWrap: "wrap",
          minWidth: 0,
        },
        "& .MuiCollapse-root": {
          minWidth: 0,
        },
      },
    },
    muiTableContainerProps: {
      sx: { maxHeight, overflow: "auto" },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: { width: "100%", boxShadow: "none" },
    },
    muiTableBodyRowProps: { hover: true },
    muiTableHeadCellProps: {
      sx: {
        fontSize: "0.78rem",
        fontWeight: 700,
        color: "#ffffff",
        backgroundColor: "#111111",
        borderBottom: "none",
        "& .Mui-TableHeadCell-Content": { color: "#ffffff" },
        "& .MuiTableSortLabel-root": { color: "#ffffff" },
        "& .MuiTableSortLabel-icon": { color: "#ffffff !important" },
        "& .MuiButtonBase-root": { color: "#ffffff" },
      },
    },
    muiTableBodyCellProps: {
      sx: { fontSize: "14px" },
    },
    muiBottomToolbarProps: {
      sx: {
        backgroundColor: "#eceff4",
        color: "#171717",
        minWidth: 0,
        "& .MuiTablePagination-root": {
          color: "#171717",
          maxWidth: "100%",
        },
        "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
          color: "#171717",
        },
        "& .MuiTablePagination-select": {
          color: "#171717",
        },
        "& .MuiTablePagination-selectIcon": {
          color: "#171717",
        },
        "& .MuiIconButton-root": {
          color: "#171717",
        },
        "& .Mui-disabled": {
          color: "rgba(23,23,23,0.35)",
        },
      },
    },
    muiPaginationProps: {
      rowsPerPageOptions: [5, 10, 20, 50],
      showRowsPerPage: true,
      shape: "rounded",
    },
    renderEmptyRowsFallback: () => (
      <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
        {emptyMessage}
      </Box>
    ),
    ...tableOptions,
    columns,
    data,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    enableRowActions: enableRowActions && !!renderRowActions,
    renderRowActions: renderRowActions
      ? ({ row }) => renderRowActions(row.original)
      : undefined,
    enablePagination,
  });
  return (
    <>
      {title && (
        <Box
          sx={combineSx(
            {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 2,
              py: 1.5,
              bgcolor: "#0f172a",
              color: "#fff",
              borderRadius: "4px 4px 0 0",
            },
            headerSx
          )}
        >
          <Box>
            <Typography sx={combineSx({ fontWeight: 700 }, titleSx)}>
              {title}
            </Typography>
            {subtitle && (
              <Typography sx={combineSx({ mt: 0.25, fontSize: "0.75rem", color: "inherit" }, subtitleSx)}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {countText !== undefined ? (
            <Typography variant="body2" sx={countSx}>
              {countText}
            </Typography>
          ) : recordCount !== undefined ? (
            <Typography variant="body2" sx={countSx}>
              {recordCount} {recordCount === 1 ? "record" : "records"}
            </Typography>
          ) : null}
        </Box>
      )}
      <MaterialReactTable table={table} />
    </>
  );
}
export default DataTable;