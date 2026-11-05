import { getLocalTimeZone, parseDate, today } from '@internationalized/date';

import type { IsoDate } from '@/api/types.ts';

const dateFormatters = {
  medium: new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }),
  long: new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }),
  month: new Intl.DateTimeFormat('en-CA', { month: 'short', timeZone: 'UTC' }),
  monthYear: new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }),
};

export function todayIso(): IsoDate {
  return today(getLocalTimeZone()).toString();
}

/** `'2026-11-04'` → `'Nov 4, 2026'`, or `'November 4, 2026'` with `'long'` */
export function formatDate(
  date: IsoDate,
  style: keyof typeof dateFormatters = 'medium',
): string {
  return dateFormatters[style].format(parseDate(date).toDate('UTC'));
}
