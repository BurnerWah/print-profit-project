// @ts-check

import {
  Paper,
  Stack,
  Table,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { TotalsTable } from './TotalsTable';
import { AddProductCell, DynamicCostCell } from './cells';
import {
  addDynamicCostColumn,
  calculatedCosts,
  consistentColumns,
  contributionColumns,
  estimatedHoursColumn,
} from './columns';

/**
 * @param {import('./prop-types').PricingTableProps} props
 */
export function PricingTable({ quote, setQuote }) {
  // The @type JSDoc comments here are to get VSCode to understand
  // what these objects are.

  /**
   * The dynamic columns that the table uses. They're generated from the frist
   * product's costs.
   * This will most likely break when interacting with the server, since
   * there'll be a period of time where the quote is empty. I'll deal with that
   * when connecting this up to the server though.
   *
   * Originally, this was wrapped in a useEffect, but the react docs's
   * {@link https://react.dev/learn/you-might-not-need-an-effect You Might Not Need an Effect}
   * page suggests that this should be avoidable, and that this can be done
   * during rendering.
   *
   * the `.flatMap` call gets the cost names for all the products, even if there aren't any.
   * the `.filter` call removes duplicates names.
   * @type {import('./data-types').ProductColumnDef[]}
   */
  const dynamicColumns = quote.products
    .flatMap((product) => product.costs.map((cost) => cost.name))
    .filter((value, index, self) => self.indexOf(value) === index)
    .map((name) => ({
      // The ID is how we can use getValue for calculations.
      id: `dynamic-cost-${name}`,
      accessorFn: (row) => row.costs.find((cost) => cost.name === name)?.value,
      header: name,
      cell: DynamicCostCell,
      aggregationFn: 'sum',
      footer: ({ table, column }) => {
        const aggregate = column.getAggregationFn();
        const { rows } = table.getCoreRowModel();
        const total = aggregate?.(`dynamic-cost-${name}`, [], rows);
        return total.toLocaleString(undefined, {
          style: 'currency',
          currency: 'USD',
        });
      },
      meta: {
        costName: name,
      },
    }));

  /**
   * All the columns the table uses.
   * This *should* get recalculated on rerenders.
   */
  const columns = [
    ...consistentColumns,
    ...dynamicColumns,
    addDynamicCostColumn,
    ...calculatedCosts,
    estimatedHoursColumn,
    ...contributionColumns,
  ];

  const table = useReactTable({
    data: quote.products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // The meta option is how we can pass the setQuote function to the cells.
    meta: {
      setQuote,
    },
  });

  /**
   * type-safe wrapper for flexRender
   * @template {object} T
   * @param {Parameters<typeof flexRender<T>>[0]} Comp
   * @param {(Parameters<typeof flexRender<T>>[1]|undefined)} props
   * @returns {ReturnType<typeof flexRender<T>>}
   */
  const safeFlexRender = (Comp, props) => {
    if (Comp && props) {
      return flexRender(Comp, props);
    }
  };

  // This is sorta awkward, but it's so far the best way I've found to get the
  // table to have the correct layout. Most libraries lack a way to get cells
  // by data field, which is what our rows are.
  return (
    <Stack direction="row" spacing={2}>
      <TableContainer component={Paper}>
        <Table size="small">
          {table.getAllFlatColumns().map((col, index) => (
            <TableRow key={col.id}>
              <TableCell variant="head">
                {safeFlexRender(
                  col.columnDef.header,
                  table
                    .getFlatHeaders()
                    .find((h) => h.id === col.id)
                    ?.getContext(),
                )}
              </TableCell>
              {table.getCoreRowModel().rows.map((row) => (
                <TableCell key={row.id}>
                  {safeFlexRender(
                    col.columnDef.cell,
                    row
                      .getAllCells()
                      .find((cell) => cell.column.id === col.id)
                      ?.getContext(),
                  )}
                </TableCell>
              ))}
              <TableCell>
                {index === 0 ? <AddProductCell table={table} /> : null}
              </TableCell>
              <TableCell variant="footer">
                {safeFlexRender(
                  col.columnDef.footer,
                  table
                    .getFooterGroups()
                    .flatMap((g) => g.headers)
                    .find((h) => h.id === col.id)
                    ?.getContext(),
                )}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </TableContainer>
      <TotalsTable quote={quote} setQuote={setQuote} table={table} />
    </Stack>
  );
}
