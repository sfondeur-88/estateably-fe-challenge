import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { BudgetProjection, CurrencyCode } from '@/api/types.ts';
import { Button } from '@/components/base/buttons/button';
import { Card } from '@/components/common/card.tsx';
import { DocumentTitle } from '@/components/common/document-title.tsx';
import { PageHeader } from '@/components/common/page-header.tsx';
import { StatusCard } from '@/components/common/status-card.tsx';
import { formatDate, todayIso } from '@/lib/dates.ts';
import { formatMoney } from '@/lib/money.ts';
import { cx } from '@/utils/cx';

import { AddScheduledItemDialog } from './add-scheduled-item/add-scheduled-item-dialog.tsx';
import { CurrencySwitch } from './currency-switch.tsx';
import { ForecastChart } from './forecast-chart.tsx';
import { MonthlyBreakdown } from './monthly-breakdown.tsx';
import { projectionQueryOptions } from './queries.ts';
import { UpcomingTable } from './upcoming-table.tsx';
import { useForecastCurrency } from './use-forecast-currency.ts';

export function ForecastPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <DocumentTitle title="Forecast" />
      <PageHeader
        title="Forecast"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <CurrencySwitch />
            <AddScheduledItemDialog />
          </div>
        }
      />
      <Projection />
      <UpcomingTable />
    </div>
  );
}

function Projection() {
  const [currency] = useForecastCurrency();
  const {
    data: projection,
    error,
    isFetching,
    isPlaceholderData,
    refetch,
  } = useQuery({
    ...projectionQueryOptions(todayIso(), currency),
    placeholderData: keepPreviousData,
  });

  if (error && !projection) {
    return (
      <StatusCard
        role="alert"
        message="We couldn't load your forecast."
        action={
          <Button
            size="sm"
            color="secondary"
            isLoading={isFetching}
            onPress={() => void refetch()}
          >
            Try again
          </Button>
        }
      />
    );
  }

  if (!projection) {
    return <StatusCard role="status" message="Loading forecast…" />;
  }

  return (
    <div
      aria-busy={isPlaceholderData}
      className="flex flex-col gap-8 transition-opacity aria-busy:opacity-60 aria-busy:delay-200"
    >
      <ProjectionSummary projection={projection} />
      <ForecastChart projection={projection} />
      <MonthlyBreakdown projection={projection} />
    </div>
  );
}

function ProjectionSummary({ projection }: { projection: BudgetProjection }) {
  const {
    currency,
    range,
    startingBalance,
    endingBalance,
    lowestPoint,
    goesNegative,
  } = projection;
  const money = (amount: number) => formatMoney(amount, currency);
  const change = endingBalance - startingBalance;

  return (
    <Card className="px-4 py-5 md:px-6">
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-3">
        <SummaryStat
          label="Today"
          value={money(startingBalance)}
          currency={currency}
        />
        <SummaryStat
          label={`By ${formatDate(range.to)}`}
          value={money(endingBalance)}
          currency={currency}
          detail={`${change > 0 ? '+' : ''}${money(change)} from today`}
        />
        {lowestPoint && (
          <SummaryStat
            label="Lowest month-end"
            value={money(lowestPoint.balance)}
            currency={currency}
            detail={`${goesNegative ? 'Below $0 on' : 'On'} ${formatDate(lowestPoint.date)}`}
            isWarning={goesNegative}
          />
        )}
      </dl>
    </Card>
  );
}

type SummaryStatProps = {
  label: string;
  value: string;
  currency: CurrencyCode;
  detail?: string;
  isWarning?: boolean;
};

function SummaryStat({
  label,
  value,
  currency,
  detail,
  isWarning,
}: SummaryStatProps) {
  return (
    <div className="flex flex-col">
      <dt className="text-sm text-tertiary">{label}</dt>
      <dd
        className={cx(
          'text-display-xs font-semibold tabular-nums',
          isWarning ? 'text-error-primary' : 'text-primary',
        )}
      >
        {value}{' '}
        <span className="text-md font-normal text-tertiary">{currency}</span>
      </dd>
      {detail && (
        <dd
          className={cx(
            'text-sm',
            isWarning ? 'text-error-primary' : 'text-tertiary',
          )}
        >
          {detail}
        </dd>
      )}
    </div>
  );
}
