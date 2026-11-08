import { Button, Group, MultiSelect, Select, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { materialStatuses, materialTypes } from "server/schemas";
import { trpc } from "../trpc";
import { statusLabels, typeLabels } from "./labels";
import type { TableState } from "./urlState";

type Props = {
  state: TableState;
  // Any filter change goes back to page 1.
  onChange: (changes: Partial<TableState>) => void;
  onClearAll: () => void;
};

const statusOptions = materialStatuses.map((value) => ({ value, label: statusLabels[value] }));
const typeOptions = materialTypes.map((value) => ({ value, label: typeLabels[value] }));

export function Filters({ state, onChange, onClearAll }: Props) {
  const plants = trpc.plants.useQuery();
  const manufacturers = trpc.manufacturers.useQuery();

  // The search box updates instantly; the URL (and so the API request) waits until typing pauses.
  const [text, setText] = useState(state.q);
  const [debouncedText] = useDebouncedValue(text, 300);

  useEffect(() => {
    if (debouncedText.trim() !== state.q) onChange({ q: debouncedText.trim() });
    // Only react to the user's typing, not to URL changes.
  }, [debouncedText]);

  // Keep the box in sync when the URL changes from elsewhere (Clear all, Back button).
  useEffect(() => {
    setText((current) => (current.trim() === state.q ? current : state.q));
  }, [state.q]);

  const hasFilters =
    state.q || state.status.length || state.type.length || state.plant || state.manufacturer;

  return (
    <Group align="flex-end" gap="sm" wrap="wrap">
      <TextInput
        label="Search"
        placeholder="Material #, description or MPN"
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        w={280}
      />
      <MultiSelect
        label="Status"
        placeholder="Any"
        data={statusOptions}
        value={state.status}
        onChange={(value) => onChange({ status: value as TableState["status"] })}
        clearable
        w={220}
      />
      <MultiSelect
        label="Material type"
        placeholder="Any"
        data={typeOptions}
        value={state.type}
        onChange={(value) => onChange({ type: value as TableState["type"] })}
        clearable
        w={220}
      />
      <Select
        label="Plant"
        placeholder="Any"
        data={(plants.data ?? []).map((p) => ({ value: p.code, label: `${p.code} · ${p.name}` }))}
        value={state.plant ?? null}
        onChange={(value) => onChange({ plant: value ?? undefined })}
        searchable
        clearable
        w={200}
      />
      <Select
        label="Manufacturer"
        placeholder="Any"
        data={(manufacturers.data ?? []).map((m) => ({ value: String(m.id), label: m.name }))}
        value={state.manufacturer ? String(state.manufacturer) : null}
        onChange={(value) => onChange({ manufacturer: value ? Number(value) : undefined })}
        searchable
        clearable
        w={200}
      />
      <Button variant="subtle" onClick={onClearAll} disabled={!hasFilters}>
        Clear all
      </Button>
    </Group>
  );
}
