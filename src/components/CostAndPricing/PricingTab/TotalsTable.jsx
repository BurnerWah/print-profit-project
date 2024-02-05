// @ts-check

import {
  Input,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { flexRender } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';

/**
 * @param {import("./prop-types").TotalsTableProps} props
 */
export function TotalsTable({ quote, table }) {
  const [contributionPercent, setContributionPercent] = useState(0);
  const [manualPrice, setManualPrice] = useState(0);
  const [pricePerItem, setPricePerItem] = useState(0);

  const aggregate = useCallback(
    /**
     * @param {string} column
     * @returns {number}
     */
    (column) => {
      const aggregationFn = table.getColumn(column).getAggregationFn();
      return aggregationFn(column, [], table.getCoreRowModel().rows);
    },
    [table.getColumn, table.getCoreRowModel],
  );

  const getCMTotalSellingPrice = useCallback(
    () => aggregate('totalVariableCosts') / (1 - contributionPercent / 100),
    [aggregate, contributionPercent],
  );

  const dynamicCostIds = quote.products[0].costs.map(
    (cost) => `dynamic-cost-${cost.name}`,
  );

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Price on target CM%</TableCell>
            <TableCell>Price on manual entry</TableCell>
            <TableCell>Price on price/item</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Total Variable Costs Row */}
          <TableRow>
            <TableCell>${getCMTotalSellingPrice().toFixed(2)}</TableCell>
            <TableCell>
              <Input
                value={manualPrice}
                onChange={(e) => setManualPrice(Number(e.target.value))}
              />
            </TableCell>
            <TableCell>
              <Input
                value={pricePerItem}
                onChange={(e) => setPricePerItem(Number(e.target.value))}
              />
            </TableCell>
          </TableRow>
          {dynamicCostIds.map((column) => (
            <TotalsTableRow key={column} table={table} column={column} />
          ))}
          <TotalsTableRow table={table} column="creditCardFee" />
          <TotalsTableRow table={table} column="totalVariableCosts" />
          <TotalsTableRow table={table} column="estimated_hours" />
          {/* This is  */}
          <ContributionRows
            profitMarginTotalPrice={getCMTotalSellingPrice()}
            totalVariableCosts={aggregate('totalVariableCosts')}
            estimatedTotalHours={aggregate('estimated_hours')}
            state={{ manualPrice, pricePerItem }}
            slots={{
              marginInput: (
                <Input
                  value={contributionPercent}
                  onChange={(e) =>
                    setContributionPercent(Number(e.target.value))
                  }
                />
              ),
            }}
          />
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/**
 * All the contribution-related components.
 * Their calculations are very closely related, so this component calculates
 * them all.
 * @param {import('./prop-types').ContributionRowsProps} props
 */
function ContributionRows({
  slots: { marginInput },
  state: { manualPrice, pricePerItem },
  profitMarginTotalPrice,
  totalVariableCosts,
  estimatedTotalHours,
}) {
  const manualContrib = manualPrice - totalVariableCosts;
  const perItemContrib = pricePerItem - totalVariableCosts;
  const targetContrib = profitMarginTotalPrice - totalVariableCosts;

  return (
    <>
      {/* Contribution Row */}
      <TableRow>
        <TableCell>
          {targetContrib.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD',
          })}
        </TableCell>
        <TableCell>
          {manualContrib.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD',
          })}
        </TableCell>
        <TableCell>
          {perItemContrib.toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD',
          })}
        </TableCell>
      </TableRow>
      {/* Contribution Margin Row */}
      <TableRow>
        <TableCell>{marginInput}</TableCell>
        <TableCell>
          {(manualContrib / manualPrice).toLocaleString(undefined, {
            style: 'percent',
          })}
        </TableCell>
        <TableCell>
          {(perItemContrib / pricePerItem).toLocaleString(undefined, {
            style: 'percent',
          })}
        </TableCell>
      </TableRow>
      {/* Contribution Per Hour Row */}
      <TableRow>
        <TableCell>
          {(targetContrib / estimatedTotalHours).toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD',
          })}
        </TableCell>
        <TableCell>
          {(manualContrib / estimatedTotalHours).toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD',
          })}
        </TableCell>
        <TableCell>
          {(perItemContrib / estimatedTotalHours).toLocaleString(undefined, {
            style: 'currency',
            currency: 'USD',
          })}
        </TableCell>
      </TableRow>
    </>
  );
}

/**
 * Used for rows which have three columns that have the same value
 * @param {import('./prop-types').TotalsTableRowProps} props
 */
function TotalsTableRow({ table, column }) {
  // Attempt to cache the footer & context
  const [footer, context] = useMemo(
    () => getFooter(table, column),
    [table, column],
  );

  return (
    <TableRow>
      <TableCell>{flexRender(footer, context)}</TableCell>
      <TableCell>{flexRender(footer, context)}</TableCell>
      <TableCell>{flexRender(footer, context)}</TableCell>
    </TableRow>
  );
}

/**
 * Gets the footer & context for a column, so it can be passed to flexRender.
 * @template TData
 * @param {import('@tanstack/react-table').Table<TData>} table
 * @param {string} columnId
 * @returns {Parameters<typeof flexRender>}
 */
function getFooter(table, columnId) {
  const column = table.getColumn(columnId);
  const footer = table
    .getFooterGroups()
    .flatMap((g) => g.headers)
    .find((h) => h.id === columnId);
  return [column.columnDef.footer, footer.getContext()];
}