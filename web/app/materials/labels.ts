import type { TableState } from "./urlState";

type Status = TableState["status"][number];
type MaterialType = TableState["type"][number];

export const statusLabels: Record<Status, string> = {
  active: "Active",
  obsolete: "Obsolete",
  pending_review: "Pending Review",
};

export const statusColors: Record<Status, string> = {
  active: "green",
  obsolete: "gray",
  pending_review: "yellow",
};

export const typeLabels: Record<MaterialType, string> = {
  spare_part: "Spare Part",
  consumable: "Consumable",
  raw_material: "Raw Material",
  tool: "Tool",
};

const aud = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });
const dateFormat = new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" });

// Price arrives as an exact decimal string; convert only to format it for display.
export const formatPrice = (price: string) => aud.format(Number(price));
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
