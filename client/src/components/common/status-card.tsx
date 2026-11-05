import type { ReactNode } from 'react';

import { Card } from './card.tsx';

type StatusCardProps = {
  message: string;
  role?: 'status' | 'alert';
  action?: ReactNode;
};

export function StatusCard({ message, role, action }: StatusCardProps) {
  return (
    <Card className="flex flex-col items-start gap-4 px-4 py-6 md:px-6">
      <p role={role} className="text-md text-tertiary">
        {message}
      </p>
      {action}
    </Card>
  );
}
