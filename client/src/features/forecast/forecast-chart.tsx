import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';

import type {
  BudgetProjection,
  CurrencyCode,
  IsoDate,
  Minor,
} from '@/api/types.ts';
import { Card } from '@/components/common/card.tsx';
import { formatDate } from '@/lib/dates.ts';
import { formatMoney, formatMoneyCompact } from '@/lib/money.ts';

type ChartPoint = {
  date: IsoDate;
  balance: Minor;
};

type ForecastChartProps = {
  projection: BudgetProjection;
};

export function ForecastChart({ projection }: ForecastChartProps) {
  const { currency, range, asOf, startingBalance, endingBalance, lowestPoint } =
    projection;

  const points: ChartPoint[] = [
    { date: asOf, balance: startingBalance },
    ...projection.series.map((bucket) => ({
      date: bucket.end,
      balance: bucket.closingBalance,
    })),
  ];

  const summary = `Projected balance from ${formatMoney(startingBalance, currency)} today to ${formatMoney(endingBalance, currency)} on ${formatDate(range.to)}.`;

  return (
    <Card className="flex flex-col gap-4 px-4 py-5 md:px-6">
      <div>
        <h2 className="text-lg font-semibold text-primary">
          Projected balance
        </h2>
        <p className="text-sm text-tertiary">
          Scheduled bills and income in your {currency} accounts. Everyday
          spending isn't included.
        </p>
      </div>
      <div role="img" aria-label={summary} className="h-56 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={points}
            accessibilityLayer={false}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--color-border-secondary)"
            />
            <XAxis
              dataKey="date"
              padding={{ left: 12, right: 12 }}
              interval={0}
              tickFormatter={(date: IsoDate) =>
                date === asOf ? 'Now' : formatDate(date, 'month')
              }
              tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value: Minor) =>
                formatMoneyCompact(value, currency)
              }
              tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            {projection.goesNegative && (
              <ReferenceLine y={0} stroke="var(--color-fg-error-primary)" />
            )}
            <Tooltip
              content={(props) => (
                <ChartTooltip {...props} currency={currency} />
              )}
              cursor={{ stroke: 'var(--color-border-primary)' }}
            />
            <Line
              type="linear"
              dataKey="balance"
              stroke="var(--color-fg-brand-primary)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--color-fg-brand-primary)' }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
            {lowestPoint && (
              <ReferenceDot
                x={lowestPoint.date}
                y={lowestPoint.balance}
                r={6}
                fill="var(--color-bg-primary)"
                stroke={
                  projection.goesNegative
                    ? 'var(--color-fg-error-primary)'
                    : 'var(--color-fg-warning-primary)'
                }
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

type ChartTooltipProps = Pick<TooltipContentProps, 'active' | 'payload'> & {
  currency: CurrencyCode;
};

function ChartTooltip({ active, payload, currency }: ChartTooltipProps) {
  const point = payload?.[0]?.payload as ChartPoint | undefined;
  if (!active || !point) return null;

  return (
    <div className="rounded-lg bg-primary px-3 py-2 shadow-lg ring-1 ring-secondary">
      <p className="text-xs text-tertiary">{formatDate(point.date)}</p>
      <p className="text-sm font-semibold text-primary tabular-nums">
        {formatMoney(point.balance, currency)}
      </p>
    </div>
  );
}
