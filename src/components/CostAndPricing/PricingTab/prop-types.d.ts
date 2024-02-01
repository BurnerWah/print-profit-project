import type { Column, Getter, Row, Table } from '@tanstack/react-table';
import type { Dispatch, SetStateAction } from 'react';
import type { Product, ProductColumnDef, Quote } from './data-types';

export interface DynamicCostCellProps<T> {
  /** the getValue function from tanstack tables */
  readonly getValue: Getter<T>;
  /** the setter for the entire quote */
  readonly setQuote: Dispatch<SetStateAction<Quote>>;
  /** the index of the product in the quote. */
  readonly productIndex: number;
  /** the index of the cost in the product. */
  readonly costIndex: number;
}

export interface ConsistentNumericCellProps<T> {
  /** the getValue function from tanstack tables */
  readonly getValue: Getter<T>;
  /** the table the cell is in */
  readonly table: Table<Product>;
  /** the row the cell is in */
  readonly row: Row<Product>;
  /** the column the cell is in */
  readonly column: Column<Product>;
}

export interface PricingTableProps {
  readonly quote: Quote;
  readonly setQuote: Dispatch<SetStateAction<Quote>>;
}

export interface DataTableProps {
  readonly data: Product[];
  readonly columns: ProductColumnDef[];
}

export interface ProductNameCellProps {
  /** the getValue function from tanstack tables */
  readonly getValue: Getter<string>;
  /** the table the cell is in */
  readonly table: Table<Product>;
  /** the row the cell is in */
  readonly row: Row<Product>;
}

export interface DollarCellProps {
  readonly getValue: Getter<number>;
}

export interface PercentCellProps {
  readonly getValue: Getter<number>;
}
