import { aggregate } from '../utils';
import { NumberFormatter } from './internal';

/**
 * @param {import("../prop-types").HeaderProps<unknown>} props
 */
export function NumberFooter({ table, column }) {
  const aggregate = column.getAggregationFn();
  const { rows } = table.getCoreRowModel();
  /** @type {number?} */
  const result = aggregate?.(column.id, [], rows);
  return result ? <NumberFormatter value={result} /> : null;
}

/**
 * @param {import("../prop-types").HeaderProps<unknown>} props
 */
export function CurrencyFooter({ table, column }) {
  const aggregate = column.getAggregationFn();
  const { rows } = table.getCoreRowModel();
  /** @type {number?} */
  const total = aggregate?.(column.id, [], rows);
  return total ? <NumberFormatter value={total} variant="currency" /> : null;
}

/**
 * @param {import("../prop-types").HeaderProps<unknown>} props
 */
export function ContributionFooter({ table, column }) {
  const divisorId = column.columnDef.meta?.footerContribDivisor;
  const format = column.columnDef.meta?.footerContribFormat ?? 'number';

  const contribution = aggregate(table, 'contributionDollars') ?? 0;
  const divisor = (divisorId ? aggregate(table, divisorId) : null) ?? 0;
  const result = divisor === 0 ? 0 : contribution / divisor;

  return <NumberFormatter value={result} variant={format} />;
}
