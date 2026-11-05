import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { Calendar as CalendarIcon } from '@untitledui/icons';
import { DatePicker, Dialog, Group, Popover } from 'react-aria-components';

import { Calendar } from '@/components/application/date-picker/calendar';
import { Button } from '@/components/base/buttons/button';
import { formatDate, todayIso } from '@/lib/dates.ts';

import { useAsOf } from './use-as-of.ts';

export function AsOfPicker() {
  const [asOf, setAsOf] = useAsOf();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-tertiary">Balances as of</span>
      <DatePicker
        aria-label="Balances as of"
        value={parseDate(asOf)}
        maxValue={today(getLocalTimeZone())}
        onChange={(date) => {
          if (date) setAsOf(date.toString());
        }}
      >
        <Group className="flex">
          <Button
            size="sm"
            color="secondary"
            iconLeading={CalendarIcon}
            className="rounded-r-none text-primary before:rounded-r-none focus-visible:z-10"
          >
            {formatDate(asOf)}
          </Button>
          <Button
            slot={null}
            size="sm"
            color="secondary"
            onPress={() => setAsOf(todayIso())}
            className="-ml-px rounded-l-none text-tertiary before:rounded-l-none focus-visible:z-10"
          >
            Today
          </Button>
        </Group>
        <Popover
          offset={8}
          placement="bottom right"
          className="transition duration-150 ease-out entering:opacity-0 motion-safe:placement-top:entering:translate-y-1 motion-safe:placement-bottom:entering:-translate-y-1 exiting:opacity-0 exiting:duration-100 exiting:ease-in"
        >
          <Dialog className="rounded-2xl bg-primary px-6 py-5 shadow-xl ring ring-secondary_alt outline-hidden">
            <Calendar />
          </Dialog>
        </Popover>
      </DatePicker>
    </div>
  );
}
