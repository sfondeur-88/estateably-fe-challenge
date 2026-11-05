import { getLocalTimeZone, today } from '@internationalized/date';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus } from '@untitledui/icons';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Form, Heading } from 'react-aria-components';
import { z } from 'zod';

import { accountsQueryOptions } from '@/api/accounts.ts';
import { ApiError } from '@/api/errors.ts';
import type { Account, AccountListMeta, Collection } from '@/api/types.ts';
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from '@/components/application/modals/modal';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { InputDate } from '@/components/base/input/input-date';
import { Label } from '@/components/base/input/label';
import {
  RadioButton,
  RadioGroup,
} from '@/components/base/radio-buttons/radio-buttons';
import { Select } from '@/components/base/select/select';
import { todayIso } from '@/lib/dates.ts';

import { createScheduledItemMutationOptions } from '../queries.ts';
import {
  type FieldName,
  FREQUENCIES,
  scheduledItemFormSchema,
} from './schema.ts';

type FieldErrors = Partial<Record<FieldName, string>>;

const frequencyLabels: Record<(typeof FREQUENCIES)[number], string> = {
  once: 'Once',
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
  quarterly: 'Every 3 months',
  yearly: 'Yearly',
};

const frequencyItems = FREQUENCIES.map((id) => ({
  id,
  label: frequencyLabels[id],
}));

function selectAccountItems(response: Collection<Account, AccountListMeta>) {
  return response.data
    .filter((account) => account.archivedAt === null)
    .map((account) => ({
      id: account.id,
      label: account.name,
      supportingText: account.currency,
    }));
}

const FIRST_INVALID_CONTROL =
  '[data-invalid] :is(input:not([type="hidden"]), button, [role="spinbutton"])';

export function AddScheduledItemDialog() {
  return (
    <DialogTrigger>
      <Button size="md" iconLeading={Plus}>
        Add bill or income
      </Button>
      <ModalOverlay>
        <Modal className="max-w-lg">
          <Dialog>
            {({ close }) => <AddScheduledItemForm onDone={close} />}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}

function AddScheduledItemForm({ onDone }: { onDone: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const { data: accountItems } = useQuery({
    ...accountsQueryOptions(todayIso()),
    select: selectAccountItems,
  });
  const create = useMutation(createScheduledItemMutationOptions());

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>(FIRST_INVALID_CONTROL)?.focus();
  }, [errors]);

  function clearError(name: FieldName) {
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const result = scheduledItemFormSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!result.success) {
      setErrors(firstMessages(z.flattenError(result.error).fieldErrors));
      return;
    }

    create.mutate(result.data, {
      onSuccess: onDone,
      onError: (error) => {
        const fieldErrors = serverFieldErrors(error);
        if (fieldErrors) {
          setErrors(fieldErrors);
        } else {
          setFormError("We couldn't save this. Please try again.");
        }
      },
    });
  }

  return (
    <Form
      ref={formRef}
      onSubmit={handleSubmit}
      validationBehavior="aria"
      className="flex flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6"
    >
      <Heading slot="title" className="text-lg font-semibold text-primary">
        Add bill or income
      </Heading>

      <RadioGroup
        name="kind"
        defaultValue="bill"
        orientation="horizontal"
        isInvalid={Boolean(errors.kind)}
        onChange={() => clearError('kind')}
        className="flex-row flex-wrap gap-x-6 gap-y-3"
      >
        <Label className="w-full">Type</Label>
        <RadioButton value="bill" label="Bill" />
        <RadioButton value="income" label="Income" />
      </RadioGroup>

      <Input
        name="name"
        label="Name"
        placeholder="Gym membership"
        isRequired
        isInvalid={Boolean(errors.name)}
        hint={errors.name}
        onChange={() => clearError('name')}
      />

      <Input
        name="amount"
        label="Amount"
        placeholder="0.00"
        inputMode="decimal"
        isRequired
        isInvalid={Boolean(errors.amount)}
        hint={errors.amount ?? 'In the account’s currency.'}
        onChange={() => clearError('amount')}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          name="frequency"
          label="How often"
          items={frequencyItems}
          defaultSelectedKey="monthly"
          isRequired
          isInvalid={Boolean(errors.frequency)}
          hint={errors.frequency}
          onSelectionChange={() => clearError('frequency')}
        >
          {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
        </Select>

        <InputDate
          name="startDate"
          label="Next due date"
          defaultValue={today(getLocalTimeZone())}
          isRequired
          isInvalid={Boolean(errors.startDate)}
          hint={errors.startDate}
          onChange={() => clearError('startDate')}
        />
      </div>

      <Select
        name="accountId"
        label="Account"
        placeholder="Choose an account"
        items={accountItems ?? []}
        isRequired
        isInvalid={Boolean(errors.accountId)}
        hint={errors.accountId}
        onSelectionChange={() => clearError('accountId')}
      >
        {(item) => (
          <Select.Item id={item.id} supportingText={item.supportingText}>
            {item.label}
          </Select.Item>
        )}
      </Select>

      {formError && (
        <p role="alert" className="text-sm text-error-primary">
          {formError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button color="secondary" onPress={onDone}>
          Cancel
        </Button>
        <Button type="submit" isLoading={create.isPending}>
          Save
        </Button>
      </div>
    </Form>
  );
}

function firstMessages(
  fieldErrors: Partial<Record<FieldName, string[]>>,
): FieldErrors {
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([name, messages]) => [
      name,
      messages?.[0],
    ]),
  );
}

const FIELD_NAMES = Object.keys(scheduledItemFormSchema.in.shape);

function isFieldName(path: string): path is FieldName {
  return FIELD_NAMES.includes(path);
}

/** Maps the server's per-field details onto the form, or `null` when the error isn't about a field. */
function serverFieldErrors(error: Error): FieldErrors | null {
  if (!(error instanceof ApiError)) return null;
  const fieldErrors: FieldErrors = {};
  for (const { path, message } of error.details) {
    if (isFieldName(path)) fieldErrors[path] = message;
  }
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}
