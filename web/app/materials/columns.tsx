import { Badge } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import type { MaterialRow } from "../trpc";
import { formatDate, formatPrice, statusColors, statusLabels, typeLabels } from "./labels";

const column = createColumnHelper<MaterialRow>();

// Column ids match the API's sort column names. Only columns with enableSorting: true can be sorted.
export const columns = [
  column.accessor("materialNumber", { header: "Material #", enableSorting: true }),
  column.accessor("description", { header: "Description", enableSorting: true }),
  column.accessor("type", { header: "Type", cell: (c) => typeLabels[c.getValue()] }),
  column.accessor("manufacturer", { header: "Manufacturer" }),
  column.accessor("mpn", { header: "MPN" }),
  column.accessor((row) => `${row.plantCode} · ${row.plantName}`, { id: "plant", header: "Plant" }),
  column.accessor("status", {
    header: "Status",
    cell: (c) => (
      <Badge color={statusColors[c.getValue()]} variant="light">
        {statusLabels[c.getValue()]}
      </Badge>
    ),
  }),
  column.accessor("unitOfMeasure", { header: "UoM" }),
  column.accessor("quantityOnHand", {
    header: "Qty on Hand",
    enableSorting: true,
    meta: { numeric: true },
    cell: (c) => c.getValue().toLocaleString("en-AU"),
  }),
  column.accessor("unitPrice", {
    header: "Unit Price",
    enableSorting: true,
    meta: { numeric: true },
    cell: (c) => formatPrice(c.getValue()),
  }),
  column.accessor("updatedAt", {
    header: "Last Updated",
    enableSorting: true,
    cell: (c) => formatDate(c.getValue()),
  }),
];

declare module "@tanstack/react-table" {
  // Lets a column ask to be right-aligned.
  interface ColumnMeta<TData, TValue> {
    numeric?: boolean;
  }
}
