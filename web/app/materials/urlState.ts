import type { ListMaterialsInput } from "server/schemas";
import { listMaterialsInput } from "server/schemas";

export type TableState = ListMaterialsInput;

const fields = listMaterialsInput.shape;

// Parse one field; anything invalid quietly falls back to that field's default.
function parseField<K extends keyof typeof fields>(key: K, raw: unknown): TableState[K] {
  const result = fields[key].safeParse(raw);
  return (result.success ? result.data : fields[key].parse(undefined)) as TableState[K];
}

const list = (value: string | null) => (value ? value.split(",").filter(Boolean) : undefined);
const num = (value: string | null) => (value === null || value === "" ? undefined : Number(value));

export function parseTableState(params: URLSearchParams): TableState {
  const [column, direction] = (params.get("sort") ?? "").split(".");
  return {
    q: parseField("q", params.get("q") ?? undefined),
    status: parseField("status", list(params.get("status"))),
    type: parseField("type", list(params.get("type"))),
    plant: parseField("plant", params.get("plant") ?? undefined),
    manufacturer: parseField("manufacturer", num(params.get("manufacturer"))),
    sort: parseField("sort", column ? { column, direction } : undefined),
    page: parseField("page", num(params.get("page"))),
    pageSize: parseField("pageSize", num(params.get("pageSize"))),
  };
}

// Defaults are left out, so the unfiltered view is just /materials.
export function toSearchParams(state: TableState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.status.length) params.set("status", state.status.join(","));
  if (state.type.length) params.set("type", state.type.join(","));
  if (state.plant) params.set("plant", state.plant);
  if (state.manufacturer) params.set("manufacturer", String(state.manufacturer));
  if (state.sort) params.set("sort", `${state.sort.column}.${state.sort.direction}`);
  if (state.page !== 1) params.set("page", String(state.page));
  if (state.pageSize !== 25) params.set("pageSize", String(state.pageSize));
  return params;
}
