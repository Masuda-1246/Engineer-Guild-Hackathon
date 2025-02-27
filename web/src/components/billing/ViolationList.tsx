import React from 'react';
import { DollarSign } from 'lucide-react';

interface Violation {
  rule_title: string;
  group_name: string;
  count: number;
  amount: number;
}

interface ViolationListProps {
  violations: Violation[];
}

export function ViolationList({ violations }: ViolationListProps) {
  if (violations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        今月の違反はありません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {violations.map((violation, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{violation.rule_title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">
                  {violation.group_name}
                </span>
                <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                  {violation.count}回の違反
                </span>
              </div>
            </div>
          </div>
          <span className="text-lg font-semibold text-red-600">
            ¥{violation.amount.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}