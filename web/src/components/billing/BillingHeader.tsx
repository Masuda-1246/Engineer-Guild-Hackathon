import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface BillingHeaderProps {
  totalAmount: number;
}

export function BillingHeader({ totalAmount }: BillingHeaderProps) {
  const currentMonth = format(new Date(), 'M月', { locale: ja });

  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium">{currentMonth}の請求額</h3>
      <span className="text-2xl font-bold text-red-600">
        ¥{totalAmount.toLocaleString()}
      </span>
    </div>
  );
}