import { z } from 'zod';

import { todayIso } from '@/lib/dates.ts';
import { parseMoneyInput } from '@/lib/money.ts';

export const FREQUENCIES = [
  'once',
  'weekly',
  'biweekly',
  'monthly',
  'quarterly',
  'yearly',
] as const;

/** Reads the form's FormData. The user types a positive amount; the sign comes from the kind. */
export const scheduledItemFormSchema = z
  .object({
    kind: z.enum(['bill', 'income'], { error: 'Choose bill or income.' }),
    name: z
      .string()
      .trim()
      .min(1, 'Enter a name.')
      .max(200, 'Keep the name under 200 characters.'),
    amount: z.string().transform((text, context) => {
      const minor = parseMoneyInput(text);
      if (minor === null || minor === 0 || !Number.isSafeInteger(minor)) {
        context.addIssue({
          code: 'custom',
          message: 'Enter an amount above $0, like 84.95.',
        });
        return z.NEVER;
      }
      return minor;
    }),
    frequency: z.enum(FREQUENCIES, { error: 'Choose how often it repeats.' }),
    startDate: z.iso
      .date({ error: 'Enter the next due date.' })
      .refine((date) => date > todayIso(), 'Choose a date after today.'),
    accountId: z.string().min(1, 'Choose an account.'),
  })
  .transform(({ amount, ...values }) => ({
    ...values,
    amount: values.kind === 'bill' ? -amount : amount,
  }));

export type ScheduledItemInput = z.output<typeof scheduledItemFormSchema>;

export type FieldName = keyof z.input<typeof scheduledItemFormSchema>;
