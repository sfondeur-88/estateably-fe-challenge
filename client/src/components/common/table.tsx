import type { ComponentProps } from 'react';

import { cx } from '@/utils/cx';

// Outer padding follows the viewport to line up with Card; inner padding follows the table's own width.
const CELL_PADDING =
  'px-3 py-3 whitespace-nowrap first:pl-4 last:pr-4 md:first:pl-6 md:last:pr-6 @3xl:px-6';

export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className="@container overflow-x-auto">
      <table className={cx('w-full text-sm', className)} {...props} />
    </div>
  );
}

export function TableHead({ className, ...props }: ComponentProps<'thead'>) {
  return (
    <thead
      className={cx('border-b border-secondary bg-secondary', className)}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return (
    <tbody className={cx('divide-y divide-secondary', className)} {...props} />
  );
}

export function TableHeader({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      className={cx(
        CELL_PADDING,
        'text-left text-xs font-medium text-tertiary',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td className={cx(CELL_PADDING, 'text-tertiary', className)} {...props} />
  );
}
