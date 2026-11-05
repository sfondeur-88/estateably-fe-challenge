import { getLocalTimeZone, parseDate, today } from '@internationalized/date';

import type { IsoDate } from '@/api/types.ts';

const mediumDateFormatter = new Intl.DateTimeFormat('en-CA', {
  dateStyle: 'medium',
  timeZone: 'UTC',
});

export function todayIso(): IsoDate {
  return today(getLocalTimeZone()).toString();
}

/** `'2026-11-04'` → `'Nov 4, 2026'` */
export function formatDate(date: IsoDate): string {
  return mediumDateFormatter.format(parseDate(date).toDate('UTC'));
}
