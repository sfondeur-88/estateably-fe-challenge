import { useSearchParams } from 'react-router';
import { z } from 'zod';

import type { IsoDate } from '@/api/types.ts';
import { todayIso } from '@/lib/dates.ts';

const asOfSchema = z.iso
  .date()
  .refine((date) => date <= todayIso())
  .catch(() => todayIso());

export function parseAsOf(value: string | null): IsoDate {
  return asOfSchema.parse(value);
}

export function useAsOf() {
  const [searchParams, setSearchParams] = useSearchParams();
  const asOf = parseAsOf(searchParams.get('asOf'));

  function setAsOf(date: IsoDate) {
    const next = parseAsOf(date);
    setSearchParams(
      (params) => {
        if (next === todayIso()) {
          params.delete('asOf');
        } else {
          params.set('asOf', next);
        }
        return params;
      },
      { replace: true },
    );
  }

  return [asOf, setAsOf] as const;
}
