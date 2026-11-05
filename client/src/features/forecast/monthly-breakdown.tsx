import type { BudgetProjection } from '@/api/types.ts';
import { Card } from '@/components/common/card.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/common/table.tsx';
import { formatDate } from '@/lib/dates.ts';
import { formatMoney } from '@/lib/money.ts';

type MonthlyBreakdownProps = {
  projection: BudgetProjection;
};

export function MonthlyBreakdown({ projection }: MonthlyBreakdownProps) {
  const money = (amount: number) => formatMoney(amount, projection.currency);
  const headingId = 'monthly-breakdown-heading';

  return (
    <Card className="overflow-hidden">
      <h2
        id={headingId}
        className="px-4 py-5 text-lg font-semibold text-primary md:px-6"
      >
        Monthly breakdown
      </h2>
      <Table aria-labelledby={headingId}>
        <TableHead>
          <tr>
            <TableHeader scope="col">Month</TableHeader>
            <TableHeader
              scope="col"
              className="hidden text-right @xl:table-cell"
            >
              Income
            </TableHeader>
            <TableHeader
              scope="col"
              className="hidden text-right @xl:table-cell"
            >
              Bills
            </TableHeader>
            <TableHeader scope="col" className="text-right">
              Net
            </TableHeader>
            <TableHeader scope="col" className="text-right">
              Closing balance
            </TableHeader>
          </tr>
        </TableHead>
        <TableBody>
          {projection.series.map((bucket) => (
            <tr key={bucket.key}>
              <TableHeader
                scope="row"
                className="text-sm font-medium text-primary"
              >
                {formatDate(bucket.end, 'monthYear')}
              </TableHeader>
              <TableCell className="hidden text-right tabular-nums @xl:table-cell">
                {money(bucket.inflow)}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums @xl:table-cell">
                {money(bucket.outflow)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {`${bucket.net > 0 ? '+' : ''}${money(bucket.net)}`}
              </TableCell>
              <TableCell className="text-right font-medium text-primary tabular-nums">
                {money(bucket.closingBalance)}
              </TableCell>
            </tr>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
