"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Trash2,
} from "lucide-react";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  searchPlaceholder?: string;
  enableRowSelection?: boolean;
  onBulkDelete?: (rows: T[]) => void;
  onExportCSV?: () => void;
  pageSize?: number;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = "Search...",
  enableRowSelection = false,
  onBulkDelete,
  onExportCSV,
  pageSize = 10,
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const allColumns = useMemo(() => {
    if (!enableRowSelection) return columns;
    const selectCol: ColumnDef<T, unknown> = {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="w-4 h-4 rounded border-border bg-bg-tertiary accent-accent-blue cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="w-4 h-4 rounded border-border bg-bg-tertiary accent-accent-blue cursor-pointer"
        />
      ),
      size: 40,
      enableSorting: false,
    };
    return [selectCol, ...columns];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection,
    initialState: { pagination: { pageSize } },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows.map((r) => r.original);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] rounded-lg border border-border bg-bg-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          {selectedRows.length > 0 && onBulkDelete && (
            <button
              onClick={() => onBulkDelete(selectedRows)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-lg bg-danger-soft text-danger border border-danger/20 hover:bg-danger/20 transition-colors"
            >
              <Trash2 size={14} />
              Delete ({selectedRows.length})
            </button>
          )}
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-lg border border-border bg-bg-tertiary text-text-secondary hover:text-text-primary hover:border-border-light transition-colors"
            >
              <Download size={14} />
              CSV
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border bg-bg-tertiary">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "px-4 py-3 text-left font-semibold text-text-secondary uppercase tracking-wider text-[11px]",
                        header.column.getCanSort() && "cursor-pointer select-none hover:text-text-primary transition-colors"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      <div className="flex items-center gap-1.5">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-text-tertiary">
                            {header.column.getIsSorted() === "asc" ? (
                              <ChevronUp size={14} />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ChevronDown size={14} />
                            ) : (
                              <ChevronsUpDown size={12} />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={allColumns.length}
                    className="px-4 py-12 text-center text-text-tertiary"
                  >
                    No results found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-border/50 hover:bg-bg-hover transition-colors",
                      row.getIsSelected() && "bg-accent-blue-soft/30"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-text-primary">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-text-tertiary">
          {enableRowSelection && (
            <span className="mr-3">
              {selectedRows.length} of {table.getFilteredRowModel().rows.length} selected
            </span>
          )}
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          {" "}({table.getFilteredRowModel().rows.length} total)
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-md border border-border text-text-secondary hover:text-text-primary hover:border-border-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsLeft size={14} />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-md border border-border text-text-secondary hover:text-text-primary hover:border-border-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-md border border-border text-text-secondary hover:text-text-primary hover:border-border-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-md border border-border text-text-secondary hover:text-text-primary hover:border-border-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
