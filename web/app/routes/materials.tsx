import {
  Alert,
  Box,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { keepPreviousData } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import { useSearchParams } from "react-router";
import { pageSizes, sortColumns, type SortColumn } from "server/schemas";
import { columns } from "../materials/columns";
import { Filters } from "../materials/Filters";
import { parseTableState, toSearchParams, type TableState } from "../materials/urlState";
import { trpc } from "../trpc";

export function meta() {
  return [{ title: "Material Register" }];
}

const DEFAULT_SORT = { column: "materialNumber", direction: "asc" } as const;

export default function MaterialsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = parseTableState(searchParams);

  const update = (changes: Partial<TableState>, { resetPage = true } = {}) => {
    const next = { ...state, ...(resetPage ? { page: 1 } : {}), ...changes };
    // Typing in search replaces the history entry; other changes can be undone with Back.
    setSearchParams(toSearchParams(next), { replace: "q" in changes });
  };

  const clearAll = () =>
    update({ q: "", status: [], type: [], plant: undefined, manufacturer: undefined });

  // keepPreviousData: show the current rows (dimmed) while the next page or filter loads.
  const query = trpc.materials.list.useQuery(state, { placeholderData: keepPreviousData });

  const sort = state.sort ?? DEFAULT_SORT;
  const sorting: SortingState = [{ id: sort.column, desc: sort.direction === "desc" }];

  const onSortingChange = (updater: Updater<SortingState>) => {
    const [next] = typeof updater === "function" ? updater(sorting) : updater;
    const column = next && (sortColumns as readonly string[]).includes(next.id) ? next : undefined;
    update(
      {
        // Sorting "off" falls back to the default sort, which is kept out of the URL.
        sort: column
          ? { column: column.id as SortColumn, direction: column.desc ? "desc" : "asc" }
          : undefined,
      },
      { resetPage: true },
    );
  };

  const table = useReactTable({
    data: query.data?.rows ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    // The server sorts and pages; the table only tracks which column header was clicked.
    manualSorting: true,
    manualPagination: true,
    defaultColumn: { enableSorting: false }, // columns opt in to sorting
    sortDescFirst: false,
    state: { sorting },
    onSortingChange,
  });

  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / state.pageSize));
  const rowCount = query.data?.rows.length ?? 0;
  const firstRow = (state.page - 1) * state.pageSize + 1;

  return (
    <Container size="100%" px="lg" py="lg">
      <Stack gap="md">
        <Title order={2}>Material Register</Title>

        <Filters state={state} onChange={(changes) => update(changes)} onClearAll={clearAll} />

        {query.isError ? (
          <Alert color="red" title="Couldn't load materials">
            <Text size="sm" mb="sm">
              {query.error.message}
            </Text>
            <Button size="xs" color="red" variant="light" onClick={() => query.refetch()}>
              Try again
            </Button>
          </Alert>
        ) : (
          <>
            <Text size="sm" c="dimmed">
              {query.isPending
                ? "Loading…"
                : rowCount > 0
                  ? `Showing ${firstRow.toLocaleString()}–${(firstRow + rowCount - 1).toLocaleString()} of ${total.toLocaleString()}`
                  : `${total.toLocaleString()} materials`}
            </Text>

            <Box pos="relative">
              <LoadingOverlay
                visible={query.isFetching && !query.isPending}
                overlayProps={{ backgroundOpacity: 0.4, blur: 1 }}
                loaderProps={{ size: "sm" }}
              />
              <Table.ScrollContainer minWidth={1300}>
                <Table striped highlightOnHover verticalSpacing="xs">
                  <Table.Thead>
                    {table.getHeaderGroups().map((group) => (
                      <Table.Tr key={group.id}>
                        {group.headers.map((header) => {
                          const sorted = header.column.getIsSorted();
                          const label = flexRender(header.column.columnDef.header, header.getContext());
                          return (
                            <Table.Th
                              key={header.id}
                              ta={header.column.columnDef.meta?.numeric ? "right" : undefined}
                              style={{ whiteSpace: "nowrap" }}
                            >
                              {header.column.getCanSort() ? (
                                <UnstyledButton
                                  onClick={header.column.getToggleSortingHandler()}
                                  fw={600}
                                  fz="sm"
                                >
                                  {label} {sorted === "asc" ? "▲" : sorted === "desc" ? "▼" : "↕"}
                                </UnstyledButton>
                              ) : (
                                label
                              )}
                            </Table.Th>
                          );
                        })}
                      </Table.Tr>
                    ))}
                  </Table.Thead>
                  <Table.Tbody>
                    {query.isPending
                      ? Array.from({ length: 10 }, (_, i) => (
                          <Table.Tr key={i}>
                            {columns.map((_, j) => (
                              <Table.Td key={j}>
                                <Skeleton height={14} />
                              </Table.Td>
                            ))}
                          </Table.Tr>
                        ))
                      : table.getRowModel().rows.map((row) => (
                          <Table.Tr key={row.original.id}>
                            {row.getVisibleCells().map((cell) => (
                              <Table.Td
                                key={cell.id}
                                ta={cell.column.columnDef.meta?.numeric ? "right" : undefined}
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </Table.Td>
                            ))}
                          </Table.Tr>
                        ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>

              {!query.isPending && rowCount === 0 && (
                <Stack align="center" py="xl" gap="xs">
                  {total > 0 ? (
                    <>
                      <Text>There are no results on this page.</Text>
                      <Button variant="light" onClick={() => update({ page: pageCount }, { resetPage: false })}>
                        Go to last page
                      </Button>
                    </>
                  ) : (
                    <>
                      <Text>No materials match your search.</Text>
                      <Button variant="light" onClick={clearAll}>
                        Clear all filters
                      </Button>
                    </>
                  )}
                </Stack>
              )}
            </Box>

            <Group justify="space-between">
              <Select
                aria-label="Rows per page"
                data={pageSizes.map((n) => ({ value: String(n), label: `${n} per page` }))}
                value={String(state.pageSize)}
                onChange={(value) =>
                  update({ pageSize: Number(value) as TableState["pageSize"] })
                }
                allowDeselect={false}
                w={140}
              />
              <Pagination
                total={pageCount}
                value={Math.min(state.page, pageCount)}
                onChange={(page) => update({ page }, { resetPage: false })}
              />
            </Group>
          </>
        )}
      </Stack>
    </Container>
  );
}
