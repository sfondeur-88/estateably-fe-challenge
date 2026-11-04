import type { ComponentProps } from 'react';

import { cx } from '@/utils/cx';

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cx(
        'rounded-xl bg-primary shadow-xs ring-1 ring-secondary',
        className,
      )}
      {...props}
    />
  );
}
